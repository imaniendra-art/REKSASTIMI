import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { Klaster } from "@/models/Klaster";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    await connectMongoDB();

    // 1. Get all matkuls claimed by the student in F02
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    if (!f02Claims || f02Claims.length === 0) {
      return NextResponse.json({ data: [] });
    }
    const matkulIds = f02Claims.map((claim: any) => claim.matkulId);

    // 2. Find which Klasters those matkuls belong to
    const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: matkulIds } }).lean();
    const klasterIds = [...new Set(klasterMatkuls.map((km: any) => km.klasterId.toString()))];

    if (klasterIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 3. Fetch the Klaster details (only active ones)
    const klasters = await Klaster.find({ 
      _id: { $in: klasterIds },
      isActive: { $ne: false } 
    }).lean();

    // 4. Fetch the student's attempts to know their progress
    const attempts = await AssessmentAttempt.find({ 
      userId: session.id,
      klasterId: { $in: klasterIds }
    }).lean();

    const attemptsMap = new Map();
    attempts.forEach((att: any) => {
      attemptsMap.set(att.klasterId.toString(), att);
    });

    // 5. Combine and format data for frontend
    const data = klasters.map((k: any) => {
      const klasterIdStr = k._id.toString();
      const attempt = attemptsMap.get(klasterIdStr);
      
      return {
        id: klasterIdStr,
        namaKlaster: k.namaKlaster,
        lmsDeskripsi: k.lmsDeskripsi || "Tes kompetensi untuk rumpun ilmu ini.",
        matkulCount: klasterMatkuls.filter((km: any) => km.klasterId.toString() === klasterIdStr).length,
        status: attempt ? attempt.status : "Not Started",
        submittedAt: attempt ? attempt.submittedAt : null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching mahasiswa asesmen:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
