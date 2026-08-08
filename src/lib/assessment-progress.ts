import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { isAttemptCompleted } from "@/lib/f03";

const statusOrder = [
  "PENDAFTARAN",
  "LENGKAPI_CV",
  "PEMBAYARAN",
  "ASESMEN_F02",
  "ASESMEN_KOMPETENSI",
  "EVALUASI_F03",
  "EVALUASI_ASESOR",
  "KONFIRMASI_HASIL",
  "SIAP_PLENO",
  "LULUS"
];

function isBeforeStatus(currentStatus: string | undefined, targetStatus: string) {
  const currentIndex = statusOrder.indexOf(currentStatus || "PENDAFTARAN");
  const targetIndex = statusOrder.indexOf(targetStatus);
  return currentIndex === -1 || (targetIndex !== -1 && currentIndex < targetIndex);
}

export async function getClaimedActiveKlasterIds(userId: string) {
  const f02Claims = await F02Pengajuan.find({ userId }).lean();
  if (!f02Claims || f02Claims.length === 0) return [];

  const matkulIds = f02Claims
    .filter((claim: any) => claim.matkulId)
    .map((claim: any) => claim.matkulId);

  if (matkulIds.length === 0) return [];

  const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: matkulIds } }).lean();
  const klasterIds = [...new Set(klasterMatkuls.map((km: any) => km.klasterId?.toString()).filter(Boolean))];
  if (klasterIds.length === 0) return [];

  const activeKlasters = await Klaster.find({
    _id: { $in: klasterIds },
    isActive: { $ne: false }
  }).select("_id").lean();

  return activeKlasters.map((klaster: any) => klaster._id.toString());
}

export async function hasCompletedAllClaimedAssessments(userId: string) {
  const klasterIds = await getClaimedActiveKlasterIds(userId);
  if (klasterIds.length === 0) return false;

  const attempts = await AssessmentAttempt.find({
    userId,
    klasterId: { $in: klasterIds }
  }).lean();

  const attemptsMap = new Map();
  attempts.forEach((attempt: any) => {
    attemptsMap.set(attempt.klasterId?.toString(), attempt);
  });

  return klasterIds.every((klasterId) => isAttemptCompleted(attemptsMap.get(klasterId)));
}

export async function syncProfileToF03WhenAssessmentsComplete(userId: string) {
  const allAssessmentsCompleted = await hasCompletedAllClaimedAssessments(userId);
  if (!allAssessmentsCompleted) return false;

  const profile = await ApplicantProfile.findOne({ userId }).select("statusRpl progress").lean() as any;
  if (!profile || !isBeforeStatus(profile.statusRpl, "EVALUASI_F03")) return false;

  await ApplicantProfile.updateOne(
    { userId },
    {
      $set: {
        statusRpl: "EVALUASI_F03",
        statusAsesmen: "SELESAI",
        statusF03: "BELUM",
        "progress.assessmentStatus": "SELESAI",
        "progress.f03Status": "BELUM"
      }
    }
  );

  return true;
}
export async function syncProfileToEvaluasiAsesorWhenF03Complete(userId: string) {
  const klasterIds = await getClaimedActiveKlasterIds(userId);
  if (klasterIds.length === 0) return false;

  const F03Evaluasi = (await import("@/models/F03Evaluasi")).F03Evaluasi;

  let allSubmitted = true;

  for (const klasterId of klasterIds) {
    const f02Claims = await F02Pengajuan.find({ userId }).lean();
    const claimedMatkulIds = f02Claims.map((c: any) => c.matkulId?.toString()).filter(Boolean);

    const klasterMatkuls = await KlasterMatkul.find({ klasterId }).lean();
    const validMatkulIds = klasterMatkuls
      .filter((km: any) => claimedMatkulIds.includes(km.matkulId?.toString()))
      .map((km: any) => km.matkulId?.toString());

    if (validMatkulIds.length === 0) continue;

    const submittedF03s = await F03Evaluasi.countDocuments({
      userId,
      klasterId,
      courseId: { $in: validMatkulIds },
      isSubmitted: true
    });

    if (submittedF03s < validMatkulIds.length) {
      allSubmitted = false;
      break;
    }
  }

  if (!allSubmitted) return false;

  const profile = await ApplicantProfile.findOne({ userId }).select("statusRpl progress").lean() as any;
  if (!profile || !isBeforeStatus(profile.statusRpl, "EVALUASI_ASESOR")) return false;

  await ApplicantProfile.updateOne(
    { userId },
    {
      $set: {
        statusRpl: "EVALUASI_ASESOR",
        statusF03: "SELESAI",
        "progress.f03Status": "SELESAI"
      }
    }
  );

  return true;
}
