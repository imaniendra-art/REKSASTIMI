import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { Klaster } from "@/models/Klaster";

export async function POST(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { materialId, answers, isWatched } = body;

    if (!materialId) {
      return NextResponse.json({ message: "materialId is required" }, { status: 400 });
    }

    await connectMongoDB();

    // Verify material exists and calculate score
    const klaster = await Klaster.findById(resolvedParams.klasterId).lean() as any;
    if (!klaster) {
      return NextResponse.json({ message: "Klaster tidak ditemukan" }, { status: 404 });
    }

    const material = klaster.learningMaterials?.find((m: any) => m._id.toString() === materialId);
    if (!material) {
      return NextResponse.json({ message: "Material tidak ditemukan" }, { status: 404 });
    }

    // Process pretest answers
    let pretestScore = 0;
    const processedAnswers = [];
    let totalScorePotential = 0;

    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const question = material.pretestQuestions?.find((q: any) => q._id.toString() === ans.questionId);
        if (question) {
          const isCorrect = question.correctAnswer === ans.selectedOption;
          if (isCorrect) {
            pretestScore += (question.score || 10);
          }
          totalScorePotential += (question.score || 10);
          
          processedAnswers.push({
            questionId: question._id,
            selectedOption: ans.selectedOption,
            isCorrect
          });
        }
      }
    }

    // Convert pretest score to a 0-100 scale (optional, but good for reporting)
    const finalScore = totalScorePotential > 0 ? Math.round((pretestScore / totalScorePotential) * 100) : 0;

    // Find attempt
    let attempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId: resolvedParams.klasterId });
    
    if (!attempt) {
      // Create new attempt draft
      attempt = new AssessmentAttempt({
        userId: session.id,
        klasterId: resolvedParams.klasterId,
        status: "Draft",
        learningProgress: []
      });
    }

    // Update learning progress
    const progressIndex = attempt.learningProgress.findIndex((p: any) => p.materialId.toString() === materialId);
    
    const progressData = {
      materialId: material._id,
      isWatched: isWatched || false,
      watchedAt: isWatched ? new Date() : undefined,
      pretestSubmittedAt: answers ? new Date() : undefined,
      pretestScore: answers ? finalScore : 0,
      isCompleted: isWatched && answers !== undefined, // completed if watched and pretest submitted
      pretestAnswers: processedAnswers
    };

    if (progressIndex > -1) {
      // Merge
      const existing = attempt.learningProgress[progressIndex];
      attempt.learningProgress[progressIndex] = {
        ...existing.toObject(),
        ...progressData,
        watchedAt: existing.watchedAt || progressData.watchedAt
      };
    } else {
      attempt.learningProgress.push(progressData);
    }

    await attempt.save();

    return NextResponse.json({
      message: "Progres materi tersimpan",
      data: {
        materialId,
        isCompleted: progressData.isCompleted,
        pretestScore: answers ? finalScore : undefined,
        correctCount: answers ? processedAnswers.filter(a => a.isCorrect).length : undefined,
        totalQuestions: answers ? processedAnswers.length : undefined
      }
    });

  } catch (error) {
    console.error("Error submitting pretest:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
