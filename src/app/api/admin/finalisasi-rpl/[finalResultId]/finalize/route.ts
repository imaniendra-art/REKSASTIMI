import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSanggahan } from "@/models/RplSanggahan";

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

    if (result.mahasiswaDecisionStatus !== "DITERIMA" && result.mahasiswaDecisionStatus !== "SANGGAHAN_SELESAI") {
      return NextResponse.json({ message: "Mahasiswa belum menerima hasil atau sanggahan belum selesai" }, { status: 400 });
    }

    const activeSanggahan = await RplSanggahan.findOne({
      finalResultId,
      status: { $in: ["SUBMITTED", "DITINDAKLANJUTI"] }
    });

    if (activeSanggahan) {
      return NextResponse.json({ message: "Masih terdapat sanggahan aktif yang belum diselesaikan" }, { status: 400 });
    }

    if (!result.recognizedCourses || result.recognizedCourses.length === 0) {
      return NextResponse.json({ message: "Daftar mata kuliah yang diakui tidak boleh kosong" }, { status: 400 });
    }

    result.statusFinalisasi = "FINAL";
    result.finalizedBy = session.id;
    result.finalizedAt = new Date();
    
    // Set to SIAP_PLENO if it was BELUM_PLENO
    if (result.plenoStatus === "BELUM_PLENO") {
      result.plenoStatus = "SIAP_PLENO";
    }

    await result.save();

    return NextResponse.json({ message: "Hasil RPL berhasil difinalisasi" });
  } catch (error: any) {
    console.error("Error finalizing RPL:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
