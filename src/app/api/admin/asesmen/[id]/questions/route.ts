import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { AssessmentQuestion } from "@/models/AssessmentQuestion";
import { MataKuliah } from "@/models/MataKuliah"; // Import to populate

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const resolvedParams = await params;
    await connectMongoDB();
    const questions = await AssessmentQuestion.find({ klaster: resolvedParams.id })
      .populate({ path: "course", model: MataKuliah, select: "kode namaMatkul" })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const data = questions.map((q: any) => ({
      id: q._id.toString(),
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      order: q.order,
      isActive: q.isActive,
      course: q.course ? { id: q.course._id.toString(), kode: q.course.kode, namaMatkul: q.course.namaMatkul } : null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { course, type, questionText, options, correctAnswer, order, isActive } = body;

    if (!questionText) {
      return NextResponse.json({ message: "Pertanyaan wajib diisi" }, { status: 400 });
    }

    if (type === "MULTIPLE_CHOICE" && (!options || !correctAnswer)) {
      return NextResponse.json({ message: "Opsi dan Jawaban Benar wajib diisi untuk Pilihan Ganda" }, { status: 400 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    const newQuestion = await AssessmentQuestion.create({
      klaster: resolvedParams.id,
      course: course || undefined,
      type: type || "MULTIPLE_CHOICE",
      questionText,
      options: type === "MULTIPLE_CHOICE" ? options : [],
      correctAnswer: type === "MULTIPLE_CHOICE" ? correctAnswer : undefined,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      message: "Pertanyaan berhasil ditambahkan",
      data: {
        id: newQuestion._id.toString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
