import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ plottingId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "penilai") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { plottingId } = await params;
    if (!mongoose.Types.ObjectId.isValid(plottingId)) {
      return NextResponse.json({ message: "ID Plotting tidak valid" }, { status: 400 });
    }

    await connectMongoDB();

    const plotting = await PenilaiPlotting.findOne({ _id: plottingId, status: { $ne: "Dibatalkan" } });
    if (!plotting) {
      return NextResponse.json({ message: "Plotting tidak ditemukan" }, { status: 404 });
    }

    if ((plotting as any).penilaiId.toString() !== session.id) {
      return NextResponse.json({ message: "Akses ditolak: Data ini bukan plotting Anda" }, { status: 403 });
    }

    const body = await req.json();
    const { entries } = body;
    if (!Array.isArray(entries)) {
      return NextResponse.json({ message: "Format data tidak valid" }, { status: 400 });
    }

    // Process each entry
    for (const entry of entries) {
      const { f03EvaluasiId, courseId, vatm, nilaiHuruf, catatanPenilai } = entry;

      if (!f03EvaluasiId) continue; // Skip if no f03 id (means student hasn't submitted this row)

      // Validate VATM
      const validVatm = Array.isArray(vatm) ? vatm.filter((v: string) => ["V", "A", "T", "M"].includes(v)) : [];

      // Validasi Grade
      const validGrades = ["A", "A-", "B+", "B", "B-", "C", "D", "E"];
      const finalGrade = validGrades.includes(nilaiHuruf) ? nilaiHuruf : null;

      // Update
      await F03Evaluasi.findByIdAndUpdate(entry.f03EvaluasiId, {
        statusValidasi: validVatm,
        nilaiHuruf: finalGrade,
        catatanAsesor: entry.catatanPenilai,
        tanggalPenilaian: entry.tanggalPenilaian ? new Date(entry.tanggalPenilaian) : new Date(),
        waktuPenilaian: entry.waktuPenilaian,
        lokasiPenilaian: entry.lokasiPenilaian,
        penilai1: entry.penilai1 || session.name || "Penilai",
        penilai2: entry.penilai2,
        isSubmitted: !!finalGrade,
      });
    }

    // Optional: check if all are graded, then update Plotting status
    // Count required matkul
    const { KlasterMatkul } = await import("@/models/KlasterMatkul");
    const { F02Pengajuan } = await import("@/models/F02Pengajuan");
    
    const klasterMatkuls = await KlasterMatkul.find({ klasterId: (plotting as any).klasterId }).lean();
    const allMatkulIds = klasterMatkuls.map((km: any) => km.matkulId.toString());
    const f02List = await F02Pengajuan.find({ userId: (plotting as any).mahasiswaId, matkulId: { $in: allMatkulIds } }).lean();
    const requiredCount = f02List.length > 0 ? f02List.length : allMatkulIds.length;

    const allF03 = await F03Evaluasi.find({ userId: (plotting as any).mahasiswaId, klasterId: (plotting as any).klasterId }).lean();
    const gradedCount = allF03.filter((f: any) => f.nilaiHuruf && f.statusValidasi && f.statusValidasi.length > 0).length;

    if (gradedCount >= requiredCount && requiredCount > 0) {
      plotting.status = "Selesai";
      await plotting.save();
    } else {
      if (plotting.status !== "Aktif") {
        plotting.status = "Aktif";
        await plotting.save();
      }
    }

    return NextResponse.json({ message: "Penilaian berhasil disimpan" });
  } catch (error: any) {
    console.error("Error saving penilai f03:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
