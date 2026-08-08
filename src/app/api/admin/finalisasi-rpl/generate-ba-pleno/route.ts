import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSkDocument } from "@/models/RplSkDocument";
import { Period } from "@/models/Period";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    await connectMongoDB();
    const body = await req.json();
    const { periodId } = body;

    if (!periodId) return NextResponse.json({ message: "periodId diperlukan" }, { status: 400 });

    const results = await RplFinalResult.find({
      periodId,
      statusFinalisasi: "FINAL",
      plenoStatus: { $in: ["SIAP_PLENO", "SUDAH_PLENO"] }
    }).populate("mahasiswaId", "name username").lean();

    if (results.length === 0) {
      return NextResponse.json({ message: "Tidak ada mahasiswa yang SIAP_PLENO atau FINAL pada periode ini" }, { status: 400 });
    }

    // Check if BA_PLENO already exists
    let baPleno = await RplSkDocument.findOne({ periodId, skType: "BA_PLENO" });
    if (baPleno && baPleno.status === "FINAL") {
      return NextResponse.json({ message: "BA Pleno sudah FINAL dan tidak dapat di-generate ulang" }, { status: 400 });
    }

    if (!baPleno) {
      const activePeriod = await Period.findById(periodId).lean();
      baPleno = new RplSkDocument({
        periodId,
        skType: "BA_PLENO",
        skNumber: `DRAFT/BA-PLENO/RPL/${activePeriod?.tahunAkademik || "..."}`,
        title: "BERITA ACARA PLENO PENETAPAN HASIL REKOGNISI PEMBELAJARAN LAMPAU",
        status: "DRAFT",
        createdBy: session.id,
        konsideranMenimbang: ["Bahwa proses penilaian RPL telah selesai dilaksanakan..."],
        dasarHukum: ["Pedoman RPL STIMI YAPMI Makassar"],
        diktumMenetapkan: ["Menetapkan hasil konversi RPL..."],
      });
      await baPleno.save();
    }

    // Update the students' baPlenoSkId and plenoStatus
    for (const r of results) {
      await RplFinalResult.updateOne(
        { _id: r._id },
        { 
          $set: { 
            baPlenoSkId: baPleno._id,
            plenoStatus: "SUDAH_PLENO"
          } 
        }
      );
    }

    return NextResponse.json({ message: "Berita Acara Pleno berhasil di-generate (DRAFT)", data: baPleno });
  } catch (error: any) {
    console.error("Error generating BA Pleno:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
