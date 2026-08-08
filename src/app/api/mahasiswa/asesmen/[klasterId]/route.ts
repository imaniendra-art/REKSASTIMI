import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { Klaster } from "@/models/Klaster";
import { AssessmentQuestion } from "@/models/AssessmentQuestion";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    const resolvedParams = await params;
    await connectMongoDB();

    // 1. Fetch Klaster
    const klaster = await Klaster.findById(resolvedParams.klasterId).lean();
    if (!klaster || klaster.isActive === false) {
      return NextResponse.json({ message: "Klaster tidak ditemukan atau tidak aktif" }, { status: 404 });
    }

    // 2. Check attempt status (Do NOT block, let client handle locking)
    const attempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId: resolvedParams.klasterId }).lean() as any;
    const attemptStatus = attempt ? attempt.status : "Pending";

    // 3. Find which matkuls in this klaster the student claimed
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    const claimedMatkulIds = f02Claims
      .filter((claim: any) => claim.matkulId)
      .map((claim: any) => claim.matkulId.toString());

    const klasterMatkuls = await KlasterMatkul.find({ klasterId: resolvedParams.klasterId }).populate("matkulId").lean();
    
    // Filter to only include matkuls the student claimed
    const validMatkuls = klasterMatkuls
      .filter((km: any) => km.matkulId && km.matkulId._id && claimedMatkulIds.includes(km.matkulId._id.toString()))
      .map((km: any) => ({
        id: km.matkulId._id.toString(),
        kode: km.matkulId.kode,
        namaMatkul: km.matkulId.namaMatkul
      }));

    if (validMatkuls.length === 0) {
      // If completed, still allow access to learning material even if F02 is empty or removed
      if (attemptStatus !== "Completed") {
        return NextResponse.json({ message: "Tidak ada mata kuliah yang relevan untuk klaster ini" }, { status: 403 });
      }
    }

    const validMatkulIds = validMatkuls.map((m) => m.id);

    // 4. Fetch questions for these matkuls
    const questions = await AssessmentQuestion.find({
      klaster: resolvedParams.klasterId,
      course: { $in: validMatkulIds },
      isActive: true
    }).lean();

    // Map questions securely (do NOT send correctAnswer to client)
    const secureQuestions = questions.map((q: any) => ({
      id: q._id.toString(),
      courseId: q.course ? q.course.toString() : "",
      type: q.type || "MULTIPLE_CHOICE",
      questionText: q.questionText,
      options: Array.isArray(q.options) ? q.options.map((o: any) => ({ label: o.label, text: o.text })) : [],
    }));

    // Secure learningMaterials (remove correctAnswer and filter active)
    const activeMaterials = (klaster.learningMaterials || []).filter((m: any) => m.isActive !== false);
    const secureLearningMaterials = activeMaterials.map((m: any) => ({
      id: m._id ? m._id.toString() : "",
      title: m.title,
      description: m.description,
      videoUrl: m.videoUrl,
      pdfUrl: m.pdfUrl,
      courseId: m.courseId,
      courseName: m.courseName,
      order: m.order,
      isActive: m.isActive,
      pretestQuestions: (m.pretestQuestions || [])
        .filter((pq: any) => pq.isActive !== false)
        .map((pq: any) => ({
          id: pq._id ? pq._id.toString() : "",
          questionText: pq.questionText,
          options: pq.options,
          order: pq.order,
          isActive: pq.isActive
        }))
    }));

    return NextResponse.json({
      data: {
        klaster: {
          id: klaster._id.toString(),
          namaKlaster: klaster.namaKlaster,
          lmsDeskripsi: klaster.lmsDeskripsi,
          lmsVideos: klaster.lmsVideos || [],
          lmsDocuments: klaster.lmsDocuments || [],
          learningMaterials: secureLearningMaterials,
        },
        matkuls: validMatkuls,
        questions: secureQuestions,
        attemptStatus: attemptStatus,
        learningProgress: attempt?.learningProgress || []
      }
    });

  } catch (error) {
    console.error("Error fetching klaster tes:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
