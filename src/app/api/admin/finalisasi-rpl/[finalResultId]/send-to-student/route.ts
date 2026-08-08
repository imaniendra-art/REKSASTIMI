import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";

export async function POST(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId } = await params;
    await connectMongoDB();

    const result = await RplFinalResult.findById(finalResultId);
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    if (result.statusFinalisasi === "FINAL") {
      return NextResponse.json({ message: "Hasil sudah FINAL" }, { status: 400 });
    }

    result.mahasiswaDecisionStatus = "MENUNGGU_RESPON";
    result.sentToStudentAt = new Date();
    await result.save();

    return NextResponse.json({ message: "Draf berhasil dikirim ke mahasiswa" });
  } catch (error: any) {
    console.error("Error sending draft to student:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
