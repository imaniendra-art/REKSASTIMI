import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { AssessmentQuestion } from "@/models/AssessmentQuestion";
import { Klaster } from "@/models/Klaster";
import { MataKuliah } from "@/models/MataKuliah";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";

import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { syncProfileToF03WhenAssessmentsComplete } from "@/lib/assessment-progress";

// Type definition for incoming answers
type AnswerPayload = {
  questionId: string;
  selectedOption: string;
};

function getLetterGrade(score: number): string {
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { answers }: { answers: AnswerPayload[] } = body;

    if (!Array.isArray(answers)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await connectMongoDB();

    // 1. Verify Attempt doesn't already exist as completed
    const existingAttempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId: resolvedParams.klasterId }).lean() as any;
    if (existingAttempt && (existingAttempt.status === "Completed" || existingAttempt.status === "Submitted")) {
      return NextResponse.json({ message: "Tes sudah diselesaikan sebelumnya" }, { status: 403 });
    }

    // 2. Get Klaster config
    const klaster = await Klaster.findById(resolvedParams.klasterId).lean();
    if (!klaster) {
      return NextResponse.json({ message: "Klaster tidak ditemukan" }, { status: 404 });
    }

    // 2a. Validate Learning Materials / Pretest (Backend Gating)
    if (klaster.learningMaterials && klaster.learningMaterials.length > 0) {
      const activeMaterials = klaster.learningMaterials.filter((m: any) => m.isActive !== false);
      if (activeMaterials.length > 0) {
        const attempt = existingAttempt || await AssessmentAttempt.findOne({ userId: session.id, klasterId: resolvedParams.klasterId }).lean() as any;
        const learningProgress = attempt?.learningProgress || [];
        
        const isAllCompleted = activeMaterials.every((m: any) => {
          const progress = learningProgress.find((p: any) => p.materialId?.toString() === m._id?.toString());
          if (!progress) return false;
          
          const activePretests = (m.pretestQuestions || []).filter((pq: any) => pq.isActive !== false);
          if (activePretests.length > 0) {
            return progress.isCompleted === true;
          }
          return progress.isWatched === true;
        });

        if (!isAllCompleted) {
          return NextResponse.json({ message: "Selesaikan seluruh materi dan pretest sebelum mengikuti ujian final." }, { status: 403 });
        }
      }
    }

    // 2b. Validate F02 and Empty Final Questions
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    const claimedMatkulIds = f02Claims
      .filter((claim: any) => claim.matkulId)
      .map((claim: any) => claim.matkulId.toString());

    const klasterMatkuls = await KlasterMatkul.find({ klasterId: resolvedParams.klasterId }).lean();
    const validMatkulIds = klasterMatkuls
      .filter((km: any) => km.matkulId && claimedMatkulIds.includes(km.matkulId.toString()))
      .map((km: any) => km.matkulId.toString());

    const dbActiveQuestionsCount = await AssessmentQuestion.countDocuments({
      klaster: resolvedParams.klasterId,
      course: { $in: validMatkulIds },
      isActive: true
    });

    if (dbActiveQuestionsCount === 0) {
      return NextResponse.json({ message: "Soal ujian final belum tersedia untuk klaster ini." }, { status: 400 });
    }

    const gradeBoosterEnabled = klaster.gradeBooster === true;
    const gradingPolicySnapshot = gradeBoosterEnabled ? "BOOSTER_RANDOM_SIRESTI" : "SAFETY_NET_50_PLUS_10";

    // 3. Fetch ALL questions related to the submitted answers to verify correctness securely
    const questionIds = answers.map(a => a.questionId);
    const dbQuestions = await AssessmentQuestion.find({ 
      _id: { $in: questionIds },
      klaster: resolvedParams.klasterId,
      isActive: true
    }).lean() as any[];

    if (dbQuestions.length !== questionIds.length) {
      return NextResponse.json({ message: "Ada ID soal yang tidak valid atau tidak aktif." }, { status: 400 });
    }

    for (const q of dbQuestions) {
      if (!q.course || !validMatkulIds.includes(q.course.toString())) {
         return NextResponse.json({ message: "Soal tidak relevan dengan mata kuliah Anda." }, { status: 400 });
      }
    }

    // Group DB questions by course to calculate scores per course
    const courseGroup: Record<string, { total: number; correct: number; scoresArr: number[] }> = {};
    const processedAnswers: any[] = [];

    // Initialize courseGroup and calculate Correctness
    for (const ans of answers) {
      const q = dbQuestions.find(dbQ => dbQ._id.toString() === ans.questionId);
      if (!q || !q.course) continue; // Ignore invalid questions

      const courseIdStr = q.course.toString();
      if (!courseGroup[courseIdStr]) {
        courseGroup[courseIdStr] = { total: 0, correct: 0, scoresArr: [] };
      }

      const isEssay = q.type === "ESSAY";
      const isCorrect = !isEssay && q.correctAnswer === ans.selectedOption;

      if (!isEssay) {
        courseGroup[courseIdStr].total += 1;
        if (isCorrect) {
          courseGroup[courseIdStr].correct += 1;
        }

        // For SIRESTI Booster logic, calculate per-question randomized score
        if (gradeBoosterEnabled) {
          if (isCorrect) {
            // Random 90 - 100
            courseGroup[courseIdStr].scoresArr.push(Math.floor(Math.random() * 11) + 90);
          } else {
            // Random 60 - 89
            courseGroup[courseIdStr].scoresArr.push(Math.floor(Math.random() * 30) + 60);
          }
        }
      }

      processedAnswers.push({
        questionId: q._id,
        matkulId: q.course,
        selectedAnswer: ans.selectedOption,
        isCorrect: isEssay ? null : isCorrect,
        isEssay
      });
    }

    // 4. Calculate Final Audit Scores per course
    const matkulResults: any[] = [];
    const courseIds = Object.keys(courseGroup);
    const matkuls = await MataKuliah.find({ _id: { $in: courseIds } }).lean();

    for (const courseId of courseIds) {
      const stats = courseGroup[courseId];
      const matkul = matkuls.find(m => m._id.toString() === courseId);
      
      // Calculate Raw Score (pure percentage)
      const rawScore = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      let adjustedScore = 0;

      if (gradeBoosterEnabled) {
        // Average of randomized per-question scores
        const sum = stats.scoresArr.reduce((a, b) => a + b, 0);
        adjustedScore = stats.total > 0 ? Math.round(sum / stats.total) : 0;
      } else {
        // Safety Net Logic: Base 50 + (10 * correct answers)
        // Wait, standardizing it to max 100 in case there are >5 questions.
        // The agreement was "Skor Dasar 50 + 10 poin/soal" for 5 questions.
        // Let's implement it robustly: 50 + (correct * (50 / totalQuestions))
        // So if 5 questions: 50 / 5 = 10. Correct 3 = 50 + 30 = 80.
        const pointsPerCorrect = stats.total > 0 ? (50 / stats.total) : 0;
        adjustedScore = Math.round(50 + (stats.correct * pointsPerCorrect));
      }

      // Cap at 100
      const finalScore = Math.min(Math.max(adjustedScore, 0), 100);
      const adjustmentApplied = finalScore - rawScore;

      matkulResults.push({
        matkulId: courseId,
        matkulName: matkul ? matkul.namaMatkul : "Unknown Course",
        rawScore,
        adjustedScore,
        finalScore,
        finalGrade: getLetterGrade(finalScore),
        gradingPolicySnapshot,
        gradeBoosterEnabled,
        adjustmentApplied
      });
    }

    // 5. Generate Certificate Number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Find how many certificates were issued this month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const countThisMonth = await AssessmentAttempt.countDocuments({
      status: "Completed",
      certificateIssuedAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const nextUrut = countThisMonth + 1;
    const nomorUrutStr = String(nextUrut).padStart(4, "0");
    const certificateNumber = `REKSA-LMS/${year}/${month}/${nomorUrutStr}`;

    // 6. Save Attempt
    const attemptDoc = {
      userId: session.id,
      klasterId: resolvedParams.klasterId,
      status: "Completed",
      answers: processedAnswers,
      matkulResults,
      submittedAt: now,
      certificateNumber: certificateNumber,
      certificateIssuedAt: now
    };

    if (existingAttempt) {
      await AssessmentAttempt.updateOne({ _id: existingAttempt._id }, { $set: attemptDoc });
    } else {
      await AssessmentAttempt.create(attemptDoc);
    }

    await syncProfileToF03WhenAssessmentsComplete(session.id);

    return NextResponse.json({ 
      message: "Tes berhasil diselesaikan",
      data: {
        results: matkulResults,
        certificateNumber
      }
    });

  } catch (error) {
    console.error("Error submitting tes:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
