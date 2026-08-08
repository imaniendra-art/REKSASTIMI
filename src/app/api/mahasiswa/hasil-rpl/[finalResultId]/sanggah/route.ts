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

    const body = await req.json();
    const { catatanMahasiswa } = body;

    if (!catatanMahasiswa || catatanMahasiswa.trim() === "") {
      return NextResponse.json({ message: "Catatan sanggahan wajib diisi" }, { status: 400 });
    }

    const result = await RplFinalResult.findOne({ _id: finalResultId, mahasiswaId: session.id });
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    if (result.statusFinalisasi === "FINAL") {
      return NextResponse.json({ message: "Hasil sudah FINAL" }, { status: 400 });
    }

    if (result.mahasiswaDecisionStatus !== "MENUNGGU_RESPON") {
      return NextResponse.json({ message: "Tidak dapat mengajukan sanggahan pada status ini" }, { status: 400 });
    }

    const sanggahan = new RplSanggahan({
      mahasiswaId: session.id,
      periodId: result.periodId,
      finalResultId: result._id,
      decision: "AJUKAN_SANGGAHAN",
      status: "SUBMITTED",
      catatanMahasiswa
    });
    await sanggahan.save();

    result.mahasiswaDecisionStatus = "DISANGGAH";
    result.plenoStatus = "BELUM_PLENO";
    await result.save();

    return NextResponse.json({ message: "Sanggahan berhasil diajukan" });
  } catch (error: any) {
    console.error("Error mengajukan sanggahan:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
