import { connectMongoDB } from "@/lib/mongodb";
import { RplPeriodPenilai } from "@/models/RplPeriodPenilai";
import { RplSkDocument } from "@/models/RplSkDocument";
import { User } from "@/models/User";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { PenilaiProfile } from "@/models/PenilaiProfile";
import { PenilaiKlaster } from "@/models/PenilaiKlaster";
import mongoose from "mongoose";

export function normalizeObjectId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === "object" && value !== null && "_id" in value) {
    return normalizeObjectId((value as { _id?: unknown })._id);
  }
  return String(value);
}

function toObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;
}

/**
 * Mendapatkan daftar penilai yang legal/eligible untuk klaster tertentu di periode tertentu.
 */
export async function getEligiblePenilaiForKlaster(periodId: string, klasterId: string) {
  await connectMongoDB();
  const normalizedPeriodId = normalizeObjectId(periodId);
  const normalizedKlasterId = normalizeObjectId(klasterId);

  // 1. Cek apakah SK Penilai RPL untuk periode ini sudah FINAL
  const skPenilai = await RplSkDocument.findOne({
    periodId: toObjectId(normalizedPeriodId),
    skType: "SK_PENILAI_RPL",
    status: "FINAL"
  }).lean();
  if (!skPenilai) {
    return { isSkFinal: false, eligiblePenilai: [] };
  }

  // 2. Ambil RplPeriodPenilai aktif dan eligible, lalu filter klaster secara eksplisit
  // agar aman terhadap variasi ObjectId/string dan registry model saat UAT.
  const periodPenilaiList = await RplPeriodPenilai.find({
    periodId: toObjectId(normalizedPeriodId),
    isActive: true,
    isEligibleForPlotting: true,
  }).lean();

  const matchingPeriodPenilai = periodPenilaiList.filter((pp: any) =>
    Array.isArray(pp.klasterIds) &&
    pp.klasterIds.some((id: unknown) => normalizeObjectId(id) === normalizedKlasterId)
  );

  const penilaiIds = matchingPeriodPenilai.map((pp: any) => toObjectId(normalizeObjectId(pp.penilaiId)));
  const users = await User.find({
    _id: { $in: penilaiIds },
    role: "penilai",
    status: "aktif"
  }).lean();
  const activeProfiles = await PenilaiProfile.find({
    userId: { $in: penilaiIds },
    isActive: { $ne: false }
  }).lean();
  const activeMappings = await PenilaiKlaster.find({
    penilaiId: { $in: penilaiIds },
    klasterId: toObjectId(normalizedKlasterId),
    isActive: { $ne: false }
  }).lean();

  const eligiblePenilai = [];
  for (const pp of matchingPeriodPenilai as any[]) {
    const userId = normalizeObjectId(pp.penilaiId);
    const user = users.find((u: any) => normalizeObjectId(u._id) === userId);
    const profile = activeProfiles.find((p: any) => normalizeObjectId(p.userId) === userId);
    const mapping = activeMappings.find((m: any) => normalizeObjectId(m.penilaiId) === userId);
    if (!user || !profile || !mapping) continue;
    
    eligiblePenilai.push({
      _id: user._id,
      name: user.name,
      email: user.email,
      jenisPenilai: pp.jenisPenilai,
    });
  }

  return { isSkFinal: true, eligiblePenilai };
}

/**
 * Validasi backend untuk memastikan plotting yang di-request valid secara hukum SK.
 */
export async function assertPenilaiEligible({ periodId, klasterId, penilaiId }: { periodId: string, klasterId: string, penilaiId: string }) {
  await connectMongoDB();
  const normalizedPeriodId = normalizeObjectId(periodId);
  const normalizedKlasterId = normalizeObjectId(klasterId);
  const normalizedPenilaiId = normalizeObjectId(penilaiId);
  const { isSkFinal, eligiblePenilai } = await getEligiblePenilaiForKlaster(normalizedPeriodId, normalizedKlasterId);
  
  if (!isSkFinal) {
    console.error("Penilai eligibility failed: SK Penilai FINAL tidak ditemukan", {
      periodId: normalizedPeriodId,
      klasterId: normalizedKlasterId,
      penilaiId: normalizedPenilaiId,
      isSkFinal
    });
    throw new Error("SK Penilai RPL periode aktif belum FINAL. Plotting belum dapat dilakukan.");
  }

  const isEligible = eligiblePenilai.some((p: any) => normalizeObjectId(p._id) === normalizedPenilaiId);
  if (!isEligible) {
    const periodEntry = await RplPeriodPenilai.findOne({
      periodId: toObjectId(normalizedPeriodId),
      penilaiId: toObjectId(normalizedPenilaiId),
      isActive: true
    }).lean();
    const profile = await PenilaiProfile.findOne({
      userId: toObjectId(normalizedPenilaiId),
      isActive: { $ne: false }
    }).lean();
    const klasterMapping = await PenilaiKlaster.findOne({
      penilaiId: toObjectId(normalizedPenilaiId),
      klasterId: toObjectId(normalizedKlasterId),
      isActive: { $ne: false }
    }).lean();
    console.error("Penilai eligibility failed: penilai tidak eligible untuk plotting", {
      periodId: normalizedPeriodId,
      klasterId: normalizedKlasterId,
      penilaiId: normalizedPenilaiId,
      isSkFinal,
      periodEntryFound: !!periodEntry,
      periodEntryEligible: !!(periodEntry as any)?.isEligibleForPlotting,
      periodEntryActive: !!(periodEntry as any)?.isActive,
      periodEntryKlasterMatch: Array.isArray((periodEntry as any)?.klasterIds)
        ? (periodEntry as any).klasterIds.some((id: unknown) => normalizeObjectId(id) === normalizedKlasterId)
        : false,
      penilaiProfileActive: !!profile,
      penilaiKlasterMatch: !!klasterMapping,
      eligibleIds: eligiblePenilai.map((p: any) => normalizeObjectId(p._id))
    });
    throw new Error("Penilai belum memenuhi syarat legal plotting. Pastikan Penilai aktif, memiliki klaster keahlian, dan sudah masuk SK Penilai RPL periode aktif.");
  }
  return true;
}

/**
 * Menghitung beban (load) seorang penilai pada suatu periode.
 * Beban dihitung dari jumlah plotting status Aktif.
 */
export async function getPenilaiLoad(penilaiId: string): Promise<number> {
  await connectMongoDB();
  // Untuk saat ini, asumsikan beban adalah plotting aktif secara global, 
  // atau bisa difilter per periode jika kita join dengan attempt/periode.
  // Tapi PenilaiPlotting tidak menyimpan periodId langsung, jadi hitung global active saja atau join attempt.
  // Untuk MVP beban dihitung dari global active.
  const load = await PenilaiPlotting.countDocuments({ penilaiId, status: "Aktif" });
  return load;
}
