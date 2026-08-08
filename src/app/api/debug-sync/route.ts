import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { syncProfileToEvaluasiAsesorWhenF03Complete, getClaimedActiveKlasterIds } from "@/lib/assessment-progress";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await connectMongoDB();
  const userName = request.nextUrl.searchParams.get("name") || "Iman";
  
  const user = await User.findOne({ name: new RegExp(userName, "i") }).lean();
  if (!user) return NextResponse.json({ message: "User not found" });

  const userId = user._id.toString();
  const profile = await ApplicantProfile.findOne({ userId }).lean() as any;
  
  const klasterIds = await getClaimedActiveKlasterIds(userId);
  let allSubmitted = true;
  const debugLog = [];

  for (const klasterId of klasterIds) {
    const Klaster = (await import("@/models/Klaster")).Klaster;
    const klaster = await Klaster.findById(klasterId).lean();
    const klasterName = klaster?.namaKlaster || "Unknown";

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

    debugLog.push({
      klasterId,
      klasterName,
      validMatkulsCount: validMatkulIds.length,
      submittedF03s,
      allSubmittedForKlaster: submittedF03s >= validMatkulIds.length
    });

    if (submittedF03s < validMatkulIds.length) {
      allSubmitted = false;
    }
  }

  // Force sync attempt
  const result = await syncProfileToEvaluasiAsesorWhenF03Complete(userId);

  return NextResponse.json({
    userId,
    userName: user.name,
    currentStatus: profile?.statusRpl,
    klasterIds,
    allSubmitted,
    syncResult: result,
    debugLog
  });
}
