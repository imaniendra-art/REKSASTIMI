import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { HasilPenilaianKonfirmasi } from "@/models/HasilPenilaianKonfirmasi";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ plottingId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { plottingId } = await params;
    if (!mongoose.Types.ObjectId.isValid(plottingId)) {
      return NextResponse.json({ message: "ID Plotting tidak valid" }, { status: 400 });
    }

    const { catatanAdmin, action } = await req.json();

    if (!action || !["konfirmasi", "kembalikan"].includes(action)) {
        return NextResponse.json({ message: "Aksi tidak valid. Gunakan 'konfirmasi' atau 'kembalikan'." }, { status: 400 });
    }

    await connectMongoDB();

    const plotting = await PenilaiPlotting.findOne({ _id: plottingId, status: { $ne: "Dibatalkan" } }).lean();
    if (!plotting) {
      return NextResponse.json({ message: "Plotting tidak ditemukan" }, { status: 404 });
    }

    const mId = (plotting as any).mahasiswaId;
    const kId = (plotting as any).klasterId;
    const pId = (plotting as any).penilaiId;

    if (action === "konfirmasi") {
        // Validasi kelengkapan
        const klasterMatkuls = await KlasterMatkul.find({ klasterId: kId }).lean();
        const allMatkulIds = klasterMatkuls.map((km: any) => km.matkulId.toString());

        const f02List = await F02Pengajuan.find({ userId: mId, matkulId: { $in: allMatkulIds } }).lean();
        const activeMatkulIds = f02List.length > 0 ? f02List.map((f: any) => f.matkulId.toString()) : allMatkulIds;

        const f03List = await F03Evaluasi.find({
            userId: mId,
            klasterId: kId,
            courseId: { $in: activeMatkulIds }
        }).lean();

        let totalSudahDinilai = 0;
        for (const mIdStr of activeMatkulIds) {
            const f03 = f03List.find((f: any) => f.courseId.toString() === mIdStr);
            if (f03 && f03.nilaiHuruf && f03.statusValidasi && f03.statusValidasi.length > 0) {
                totalSudahDinilai++;
            }
        }

        if (totalSudahDinilai < activeMatkulIds.length || activeMatkulIds.length === 0) {
            return NextResponse.json(
                { message: "Hasil penilaian belum lengkap. Pastikan seluruh mata kuliah sudah diberi nilai oleh Penilai." }, 
                { status: 400 }
            );
        }

        // Update atau buat Konfirmasi
        await HasilPenilaianKonfirmasi.findOneAndUpdate(
            { mahasiswaId: mId, klasterId: kId, plottingId: plottingId },
            {
                mahasiswaId: mId,
                klasterId: kId,
                plottingId: plottingId,
                penilaiId: pId,
                status: "Dikonfirmasi",
                catatanAdmin: catatanAdmin || "",
                confirmedBy: session.id,
                confirmedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Update ApplicantProfile
        await ApplicantProfile.findOneAndUpdate(
            { userId: mId },
            {
                $set: {
                    statusRpl: "KONFIRMASI_HASIL",
                    "progress.resultStatus": "KONFIRMASI"
                }
            }
        );

        return NextResponse.json({ message: "Konfirmasi hasil penilaian berhasil disimpan." });
    }

    if (action === "kembalikan") {
        // Update Konfirmasi
        await HasilPenilaianKonfirmasi.findOneAndUpdate(
            { mahasiswaId: mId, klasterId: kId, plottingId: plottingId },
            {
                mahasiswaId: mId,
                klasterId: kId,
                plottingId: plottingId,
                penilaiId: pId,
                status: "Dikembalikan",
                catatanAdmin: catatanAdmin || "Dikembalikan oleh admin untuk direvisi.",
                confirmedBy: session.id,
                confirmedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Hasil penilaian berhasil dikembalikan ke Penilai." });
    }

  } catch (error: any) {
    console.error("Error konfirmasi f03:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
