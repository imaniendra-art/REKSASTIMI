import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { HasilPenilaianKonfirmasi } from "@/models/HasilPenilaianKonfirmasi";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { Period } from "@/models/Period";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId: mahasiswaId } = await params;
    await connectMongoDB();

    const activePeriod = await Period.findOne({ isActive: true }).lean();
    if (!activePeriod) return NextResponse.json({ message: "Tidak ada periode aktif" }, { status: 400 });
    const periodId = activePeriod._id.toString();

    // 1. Cek profil mahasiswa
    const profile = await ApplicantProfile.findOne({ userId: mahasiswaId }).lean();
    if (!profile) return NextResponse.json({ message: "Profil mahasiswa tidak ditemukan" }, { status: 400 });

    // 2. Ambil F03 yang dikonfirmasi (untuk semua klaster milik mahasiswa ini)
    const f03list = await F03Evaluasi.find({ userId: mahasiswaId }).lean();
    if (f03list.length === 0) return NextResponse.json({ message: "Tidak ada data F03" }, { status: 400 });

    // Cek apakah minimal satu klaster sudah dikonfirmasi admin
    const konfirmasi = await HasilPenilaianKonfirmasi.find({ 
      mahasiswaId,
      status: "Dikonfirmasi"
    }).lean();

    if (konfirmasi.length === 0) {
      return NextResponse.json({ message: "Belum ada hasil F03 yang dikonfirmasi Admin" }, { status: 400 });
    }

    const confirmedKlasterIds = konfirmasi.map((k: any) => k.klasterId.toString());

    // Cek apakah ada F03 di klaster terkonfirmasi yang belum punya nilai huruf
    const uncompletedF03 = f03list.filter((f: any) => 
      confirmedKlasterIds.includes(f.klasterId.toString()) && (!f.nilaiHuruf || f.nilaiHuruf === "")
    );
    if (uncompletedF03.length > 0) {
      return NextResponse.json({ message: "Terdapat mata kuliah yang belum diberi nilai huruf oleh Penilai" }, { status: 400 });
    }

    // 3. Tarik data F02, KlasterMatkul, MataKuliah untuk konversi
    const allKlasterMatkul = await KlasterMatkul.find({ klasterId: { $in: confirmedKlasterIds } }).lean();
    const matkulIds = allKlasterMatkul.map((km: any) => km.matkulId.toString());
    const matkuls = await MataKuliah.find({ _id: { $in: matkulIds } }).lean();
    const plottings = await PenilaiPlotting.find({
      mahasiswaId,
      klasterId: { $in: confirmedKlasterIds },
      status: { $ne: "Dibatalkan" }
    }).lean();

    // 4. Siapkan array recognizedCourses
    let recognizedCourses = [];
    let totalSksTransfer = 0;
    let totalSksPerolehan = 0;

    for (const f03 of f03list) {
      if (!confirmedKlasterIds.includes(f03.klasterId.toString())) continue;
      
      const courseId = f03.courseId?.toString();
      if (!courseId) continue;

      const km = allKlasterMatkul.find((k: any) => k.matkulId.toString() === courseId);
      if (!km) continue;

      const mk = matkuls.find((m: any) => m._id.toString() === courseId);
      if (!mk) continue;
      const plotting = plottings.find((p: any) => p.klasterId.toString() === f03.klasterId.toString());

      // Logika deteksi "Transfer SKS" vs "Perolehan SKS"
      let suggestedJenis = "Perolehan SKS";
      let needsValidation = false;
      let sourceNote = "";

      const buktiText = Array.isArray(f03.jenisBukti) ? f03.jenisBukti.join(" ").toLowerCase() : (f03.jenisBukti || "").toLowerCase();
      const isFormalSource = buktiText.includes("ijazah") || buktiText.includes("transkrip") || buktiText.includes("formal");

      if (isFormalSource) {
        suggestedJenis = "Transfer SKS";
        needsValidation = true;
        sourceNote = "Terdeteksi kata Ijazah/Transkrip pada bukti. Mohon verifikasi apakah ini Transfer SKS.";
      }

      recognizedCourses.push({
        courseId: mk._id,
        kode: mk.kode,
        nama: mk.namaMatkul,
        sks: mk.sks,
        jenisRekognisi: "Perolehan SKS", // Default as requested
        suggestedJenisRekognisi: suggestedJenis,
        needsRekognisiValidation: needsValidation,
        rekognisiSourceNote: sourceNote,
        nilaiHuruf: f03.nilaiHuruf,
        nilaiAngka: f03.nilaiAngka || 0,
        sumber: "", // Admin can fill later
        klasterId: f03.klasterId,
        penilaiId: plotting?.penilaiId || null
      });

      totalSksPerolehan += (mk.sks || 0); // Default all to Perolehan initially
    }

    const totalSksDiakui = totalSksTransfer + totalSksPerolehan;

    // 5. Cek apakah draf sudah ada
    let finalResult = await RplFinalResult.findOne({ mahasiswaId, periodId });
    if (finalResult && finalResult.statusFinalisasi === "FINAL") {
      return NextResponse.json({ message: "Hasil RPL mahasiswa ini sudah FINAL dan tidak dapat ditimpa" }, { status: 400 });
    }

    if (!finalResult) {
      // Create new draft
      finalResult = new RplFinalResult({
        mahasiswaId,
        periodId,
        recognizedCourses,
        totalSksTransfer,
        totalSksPerolehan,
        totalSksDiakui,
        statusFinalisasi: "DRAFT",
        mahasiswaDecisionStatus: "BELUM_DIKIRIM",
        plenoStatus: "BELUM_PLENO"
      });
      await finalResult.save();
    } else {
      // Update existing draft but preserve admin edits if possible
      // For simplicity, if we re-generate, we overwrite courses but we might want to be careful.
      // Let's overwrite courses entirely since it's "Generate Draft". 
      finalResult.recognizedCourses = recognizedCourses;
      finalResult.totalSksTransfer = totalSksTransfer;
      finalResult.totalSksPerolehan = totalSksPerolehan;
      finalResult.totalSksDiakui = totalSksDiakui;
      await finalResult.save();
    }

    return NextResponse.json({ message: "Draf konversi berhasil dibuat", data: finalResult });
  } catch (error: any) {
    console.error("Error generating draft:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
