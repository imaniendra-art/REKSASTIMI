import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Period } from "@/models/Period";
import { getEligiblePenilaiForKlaster, getPenilaiLoad } from "@/lib/penilai-eligibility";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    await connectMongoDB();

    const activePeriod = await Period.findOne({ isActive: true }).lean();
    if (!activePeriod) return NextResponse.json({ message: "Tidak ada periode aktif" }, { status: 400 });

    const periodId = activePeriod._id.toString();

    // 1. Dapatkan semua Attempt yang Completed
    const attempts = await AssessmentAttempt.find({ status: "Completed" }).lean();
    
    // 2. Cek status F03 tiap attempt. Jika minimal Sebagian, maka masuk kandidat
    const allF03 = await F03Evaluasi.find().lean();
    const allKlasterMatkul = await KlasterMatkul.find().lean();
    const allF02 = await F02Pengajuan.find().lean();
    
    // 3. Ambil semua Plotting aktif saat ini (untuk cek mana yang unassigned dan hitung load awal)
    const existingPlottings = await PenilaiPlotting.find({ status: "Aktif" }).lean();

    let candidates: Array<{mahasiswaId: string, klasterId: string}> = [];

    for (const attempt of attempts) {
      const mId = attempt.userId.toString();
      const kId = attempt.klasterId.toString();

      // Skip jika sudah diplotting
      const isAlreadyAssigned = existingPlottings.some(p => p.mahasiswaId.toString() === mId && p.klasterId.toString() === kId);
      if (isAlreadyAssigned) continue;

      // Cek F03 status
      const klasterMatkulIds = allKlasterMatkul.filter(km => km.klasterId.toString() === kId).map(km => km.matkulId.toString());
      const f02MatkulIds = allF02.filter(f => f.userId.toString() === mId && klasterMatkulIds.includes(f.matkulId.toString())).map(f => f.matkulId.toString());
      const requiredCount = f02MatkulIds.length > 0 ? f02MatkulIds.length : klasterMatkulIds.length;
      
      const studentF03 = allF03.filter(f => f.userId.toString() === mId && f.klasterId.toString() === kId);

      if (studentF03.length > 0) {
        // Minimal "Sebagian" -> siap plotting
        candidates.push({ mahasiswaId: mId, klasterId: kId });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({ message: "Tidak ada mahasiswa yang memenuhi syarat untuk Auto Plotting." });
    }

    const candidateMahasiswaIds = [...new Set(candidates.map((c) => c.mahasiswaId))];
    const candidateProfiles = await ApplicantProfile.find({ userId: { $in: candidateMahasiswaIds } }).lean();

    // --- ALGORITMA ASSIGNMENT PER KLASTER ---
    // Cache eligible penilai & load per penilai agar efisien
    const klasterCache: Record<string, { isSkFinal: boolean, eligiblePenilai: any[] }> = {};
    const loadCache: Record<string, number> = {};

    let totalCandidate = candidates.length;
    let totalAssigned = 0;
    let totalSkipped = 0;
    let skippedDetails: Array<{mahasiswaId: string, klasterId: string, reason: string}> = [];
    const autoBatchId = new mongoose.Types.ObjectId().toString();
    const assignedAt = new Date();

    for (const cand of candidates) {
      const profile = candidateProfiles.find((p: any) => p.userId.toString() === cand.mahasiswaId);
      const candidatePeriodId = profile?.periodId?.toString() || periodId;
      const cacheKey = `${candidatePeriodId}:${cand.klasterId}`;
      // 1. Fetch Eligible Penilai untuk Klaster
      if (!klasterCache[cacheKey]) {
        klasterCache[cacheKey] = await getEligiblePenilaiForKlaster(candidatePeriodId, cand.klasterId);
      }
      
      const klasterInfo = klasterCache[cacheKey];
      if (!klasterInfo.isSkFinal) {
        totalSkipped++;
        skippedDetails.push({ ...cand, reason: "SK Penilai belum final" });
        continue;
      }
      if (klasterInfo.eligiblePenilai.length === 0) {
        totalSkipped++;
        skippedDetails.push({ ...cand, reason: "Tidak ada Penilai eligible" });
        continue;
      }

      // 2. Pilih Penilai dengan beban (load) paling ringan
      let selectedPenilaiId = null;
      let minLoad = Infinity;

      for (const p of klasterInfo.eligiblePenilai) {
        const pId = p._id.toString();
        if (loadCache[pId] === undefined) {
          loadCache[pId] = await getPenilaiLoad(pId);
        }
        if (loadCache[pId] < minLoad) {
          minLoad = loadCache[pId];
          selectedPenilaiId = pId;
        }
      }

      if (!selectedPenilaiId) {
        totalSkipped++;
        skippedDetails.push({ ...cand, reason: "Kesalahan pemilihan penilai" });
        continue;
      }

      // 3. Lakukan Assignment
      await PenilaiPlotting.create({
        mahasiswaId: cand.mahasiswaId,
        klasterId: cand.klasterId,
        penilaiId: selectedPenilaiId,
        assignedBy: session.id,
        status: "Aktif",
        assignmentMode: "Auto",
        assignedReason: "Auto assignment via Load Balancing",
        autoBatchId,
        assignedAt
      });

      // Update Load Cache
      loadCache[selectedPenilaiId]++;
      totalAssigned++;
    }

    return NextResponse.json({
      message: "Auto Plotting selesai",
      data: {
        totalCandidate,
        totalAssigned,
        totalSkipped,
        skippedDetails
      }
    });

  } catch (error: any) {
    console.error("Error auto plotting:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
