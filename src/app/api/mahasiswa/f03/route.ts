import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { Klaster } from "@/models/Klaster";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { isAttemptCompleted } from "@/lib/f03";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    await connectMongoDB();

    // 1. Dapatkan matkul F02 yang diajukan user
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    if (!f02Claims || f02Claims.length === 0) {
      return NextResponse.json({ data: [] });
    }
    const matkulIds = f02Claims.map((claim: any) => claim.matkulId);

    // 2. Cari klasternya
    const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: matkulIds } }).lean();
    const klasterIds = [...new Set(klasterMatkuls.map((km: any) => km.klasterId.toString()))];

    if (klasterIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const klasters = await Klaster.find({ 
      _id: { $in: klasterIds },
      isActive: { $ne: false } 
    }).lean();

    // 3. Ambil data ujian & F03 untuk gating
    const attempts = await AssessmentAttempt.find({ 
      userId: session.id,
      klasterId: { $in: klasterIds }
    }).lean();

    console.log("[F03 DEBUG] session.id:", session.id);
    console.log("[F03 DEBUG] klasterIds:", klasterIds);
    console.log("[F03 DEBUG] found attempts count:", attempts.length);

    const f03Entries = await F03Evaluasi.find({
      userId: session.id,
      klasterId: { $in: klasterIds }
    }).lean();

    const attemptsMap = new Map();
    attempts.forEach((att: any) => {
      attemptsMap.set(att.klasterId.toString(), att);
    });

    const f03Map = new Map(); // klasterId -> [f03 entries]
    f03Entries.forEach((f03: any) => {
      const kid = f03.klasterId.toString();
      if (!f03Map.has(kid)) f03Map.set(kid, []);
      f03Map.get(kid).push(f03);
    });

    // 4. Format data klaster
    const data = klasters.map((k: any) => {
      const klasterIdStr = k._id.toString();
      const attempt = attemptsMap.get(klasterIdStr);
      const f03List = f03Map.get(klasterIdStr) || [];
      
      const totalCourses = klasterMatkuls.filter((km: any) => km.klasterId.toString() === klasterIdStr).length;
      
      // Gating Logic
      const isAssessmentCompleted = isAttemptCompleted(attempt);
      const canAccess = isAssessmentCompleted;
      const reason = isAssessmentCompleted 
        ? "" 
        : "F03 belum dapat diakses. Selesaikan Tes Kompetensi terlebih dahulu.";

      const isSubmitted = f03List.length > 0 && f03List.every((entry: any) => entry.isSubmitted);

      return {
        klasterId: klasterIdStr,
        klasterName: k.namaKlaster,
        canAccess,
        reason,
        assessmentStatus: attempt?.status || "Not Started",
        certificateNumber: attempt?.certificateNumber || null,
        totalCourses,
        completedEntries: f03List.length,
        totalEntries: totalCourses,
        isSubmitted
      };
    });

    return NextResponse.json({ 
      data,
      debug: {
        sessionId: session.id,
        klasterIds,
        attemptsCount: attempts.length,
        attemptsFound: attempts.map(a => ({ id: a._id, klasterId: a.klasterId, status: a.status, cert: a.certificateNumber }))
      }
    });
  } catch (error) {
    console.error("Error fetching mahasiswa f03 list:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
