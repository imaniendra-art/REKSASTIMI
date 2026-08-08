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
      plenoStatus: "SUDAH_PLENO"
    }).populate("mahasiswaId", "name username").lean();

    if (results.length === 0) {
      return NextResponse.json({ message: "Tidak ada mahasiswa yang SUDAH_PLENO pada periode ini" }, { status: 400 });
    }

    // Cek apakah BA_PLENO ada
    const baPleno = await RplSkDocument.findOne({ periodId, skType: "BA_PLENO" }).lean();
    if (!baPleno) {
      return NextResponse.json({ message: "Generate BA Pleno terlebih dahulu" }, { status: 400 });
    }

    // Check if SK_HASIL_RPL already exists
    let skHasil = await RplSkDocument.findOne({ periodId, skType: "SK_HASIL_RPL" });
    if (skHasil && skHasil.status === "FINAL") {
      return NextResponse.json({ message: "SK Hasil RPL sudah FINAL dan tidak dapat di-generate ulang" }, { status: 400 });
    }

    if (!skHasil) {
      const activePeriod = await Period.findById(periodId).lean();
      skHasil = new RplSkDocument({
        periodId,
        skType: "SK_HASIL_RPL",
        skNumber: `DRAFT/SK-HASIL/RPL/${activePeriod?.tahunAkademik || "..."}`,
        title: "PENETAPAN HASIL REKOGNISI PEMBELAJARAN LAMPAU",
        status: "DRAFT",
        createdBy: session.id,
        konsideranMenimbang: ["Bahwa proses penilaian dan Pleno RPL telah selesai dilaksanakan..."],
        dasarHukum: ["Pedoman RPL STIMI YAPMI Makassar"],
        diktumMenetapkan: ["Menetapkan hasil konversi SKS untuk mahasiswa RPL..."],
      });
      await skHasil.save();
    }

    // Update the students' skHasilRplId
    for (const r of results) {
      await RplFinalResult.updateOne(
        { _id: r._id },
        { 
          $set: { 
            skHasilRplId: skHasil._id
          } 
        }
      );
    }

    return NextResponse.json({ message: "SK Hasil RPL berhasil di-generate (DRAFT)", data: skHasil });
  } catch (error: any) {
    console.error("Error generating SK Hasil RPL:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
