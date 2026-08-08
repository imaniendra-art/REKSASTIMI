import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { Klaster } from "@/models/Klaster";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { isAttemptCompleted } from "@/lib/f03";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    const user = await User.findOne({ username: "iman" }).lean();
    if (!user) return NextResponse.json({ message: "User not found" });

    const sessionId = user._id.toString();

    const f02Claims = await F02Pengajuan.find({ userId: sessionId }).lean();
    const matkulIds = f02Claims.map((claim: any) => claim.matkulId);

    const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: matkulIds } }).lean();
    const klasterIds = [...new Set(klasterMatkuls.map((km: any) => km.klasterId.toString()))];

    const klasters = await Klaster.find({ 
      _id: { $in: klasterIds },
      isActive: { $ne: false } 
    }).lean();

    const attempts = await AssessmentAttempt.find({ 
      userId: sessionId,
      klasterId: { $in: klasterIds }
    }).lean();

    const f03Entries = await F03Evaluasi.find({
      userId: sessionId,
      klasterId: { $in: klasterIds }
    }).lean();

    const attemptsMap = new Map();
    attempts.forEach((att: any) => {
      attemptsMap.set(att.klasterId.toString(), att);
    });

    const data = klasters.map((k: any) => {
      const klasterIdStr = k._id.toString();
      const attempt = attemptsMap.get(klasterIdStr);
      
      return {
        klasterId: klasterIdStr,
        klasterName: k.namaKlaster,
        hasAttempt: !!attempt,
        attemptStatus: attempt?.status,
        attemptCert: attempt?.certificateNumber,
        isCompletedCall: isAttemptCompleted(attempt),
        canAccess: isAttemptCompleted(attempt)
      };
    });

    return NextResponse.json({ 
      user: sessionId,
      f02Count: f02Claims.length,
      klasterIds,
      attemptsFound: attempts.length,
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
