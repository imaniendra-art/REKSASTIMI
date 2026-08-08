import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSanggahan } from "@/models/RplSanggahan";

export async function POST(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "mahasiswa") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId } = await params;
    await connectMongoDB();

    const result = await RplFinalResult.findOne({ _id: finalResultId, mahasiswaId: session.id });
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    if (result.statusFinalisasi === "FINAL") {
      return NextResponse.json({ message: "Hasil sudah FINAL" }, { status: 400 });
    }

    if (!["MENUNGGU_RESPON", "SANGGAHAN_SELESAI"].includes(result.mahasiswaDecisionStatus)) {
      return NextResponse.json({ message: "Tidak dapat menerima hasil pada status ini" }, { status: 400 });
    }

    // Buat sanggahan type TERIMA_HASIL
    const sanggahan = new RplSanggahan({
      mahasiswaId: session.id,
      periodId: result.periodId,
      finalResultId: result._id,
      decision: "TERIMA_HASIL",
      status: "SELESAI",
      catatanMahasiswa: ""
    });
    await sanggahan.save();

    result.mahasiswaDecisionStatus = "DITERIMA";
    result.acceptedAt = new Date();
    result.readyForPlenoAt = new Date();
    // Bisa lgsg masuk SIAP_PLENO sesuai request
    result.plenoStatus = "SIAP_PLENO";
    await result.save();

    return NextResponse.json({ message: "Berhasil menerima hasil RPL" });
  } catch (error: any) {
    console.error("Error menerima hasil:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
