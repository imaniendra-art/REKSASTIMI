import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { AssessmentQuestion } from "@/models/AssessmentQuestion";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { course, type, questionText, options, correctAnswer, order, isActive } = body;

    const resolvedParams = await params;
    await connectMongoDB();

    const updateData: any = {};
    if (course !== undefined) updateData.course = course || null;
    if (type !== undefined) updateData.type = type;
    if (questionText !== undefined) updateData.questionText = questionText;
    
    // Logic for type ESSAY vs MULTIPLE_CHOICE
    if (updateData.type === "ESSAY" || (!updateData.type && type === "ESSAY")) {
      updateData.options = [];
      updateData.correctAnswer = "";
    } else {
      if (options !== undefined) updateData.options = options;
      if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    }

    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedQuestion = await AssessmentQuestion.findByIdAndUpdate(
      resolvedParams.questionId,
      updateData,
      { new: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json({ message: "Pertanyaan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Pertanyaan berhasil diperbarui",
      data: { id: updatedQuestion._id.toString() }
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
