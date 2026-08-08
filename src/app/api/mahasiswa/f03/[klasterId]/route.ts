import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { Klaster } from "@/models/Klaster";
import { MataKuliah } from "@/models/MataKuliah";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { JENIS_BUKTI_F03, isAttemptCompleted } from "@/lib/f03";

export async function GET(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });
  const { klasterId } = await params;

  try {
    await connectMongoDB();

    // 1. Validasi Klaster dan Gating
    const attempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId }).lean() as any;
    if (!isAttemptCompleted(attempt)) {
      return NextResponse.json({ 
        canAccess: false, 
        reason: "F03 belum dapat diakses. Selesaikan Tes Kompetensi terlebih dahulu." 
      }, { status: 403 });
    }

    // 2. Fetch User Data
    const user = await User.findById(session.id).lean();
    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();
    
    const klaster = await Klaster.findById(klasterId).lean();
    if (!klaster) return NextResponse.json({ message: "Klaster tidak ditemukan" }, { status: 404 });

    // 3. Fetch MataKuliah from F02 for this klaster
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    const claimedMatkulIds = f02Claims.map((claim: any) => claim.matkulId.toString());

    const klasterMatkuls = await KlasterMatkul.find({ klasterId }).lean();
    const validMatkulIds = klasterMatkuls
      .filter((km: any) => claimedMatkulIds.includes(km.matkulId.toString()))
      .map((km: any) => km.matkulId);

    const matkuls = await MataKuliah.find({ _id: { $in: validMatkulIds } }).lean();

    // 4. Fetch existing F03 entries
    const existingF03 = await F03Evaluasi.find({ userId: session.id, klasterId }).lean();

    // 5. Fetch CPMK for each Matkul
    const MatkulCpmk = (await import("@/models/MatkulCpmk")).MatkulCpmk;
    const cpmks = await MatkulCpmk.find({ matkulId: { $in: validMatkulIds } }).lean();
    
    const matkulsWithCpmk = matkuls.map((m: any) => ({
      ...m,
      cpmkList: cpmks.filter((c: any) => c.matkulId.toString() === m._id.toString()).sort((a: any, b: any) => a.nomorUrut - b.nomorUrut)
    }));

    return NextResponse.json({
      canAccess: true,
      student: {
        fullName: user.name,
        nim: profile?.nim || user.username,
      },
      klaster: {
        id: klaster._id,
        namaKlaster: klaster.namaKlaster,
      },
      attempt: {
        certificateNumber: attempt.certificateNumber,
        matkulResults: attempt.matkulResults || []
      },
      matkuls: matkulsWithCpmk,
      existingF03,
      jenisBuktiList: JENIS_BUKTI_F03
    });

  } catch (error) {
    console.error("Error fetching f03 detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });
  const { klasterId } = await params;

  try {
    await connectMongoDB();

    // 1. Gating
    const attempt = await AssessmentAttempt.findOne({ userId: session.id, klasterId }).lean() as any;
    if (!isAttemptCompleted(attempt)) {
      return NextResponse.json({ message: "Tes Kompetensi belum diselesaikan." }, { status: 403 });
    }

    const { entries, isSubmitted } = await request.json();

    if (!Array.isArray(entries)) {
      return NextResponse.json({ message: "Invalid payload format." }, { status: 400 });
    }

    // 2. Validasi valid matkuls
    const f02Claims = await F02Pengajuan.find({ userId: session.id }).lean();
    const claimedMatkulIds = f02Claims.map((claim: any) => claim.matkulId.toString());
    const klasterMatkuls = await KlasterMatkul.find({ klasterId }).lean();
    const validMatkulIds = klasterMatkuls
      .filter((km: any) => claimedMatkulIds.includes(km.matkulId.toString()))
      .map((km: any) => km.matkulId.toString());

    // 3. Upsert F03 entries
    for (const entry of entries) {
      if (!validMatkulIds.includes(entry.courseId)) continue;
      
      if (!entry.tingkatKemampuan || !entry.jenisBukti || entry.jenisBukti.length === 0) {
        continue; // Skip invalid entries
      }

      await F03Evaluasi.findOneAndUpdate(
        { userId: session.id, klasterId, courseId: entry.courseId },
        {
          $set: {
            assessmentAttemptId: attempt._id,
            tingkatKemampuan: entry.tingkatKemampuan,
            jenisBukti: entry.jenisBukti,
            buktiFileUrl: entry.buktiFileUrl || "",
            isSubmitted: isSubmitted || false,
            submittedAt: isSubmitted ? new Date() : undefined
          }
        },
        { upsert: true, new: true }
      );
    }

    if (isSubmitted) {
      const { syncProfileToEvaluasiAsesorWhenF03Complete } = await import("@/lib/assessment-progress");
      await syncProfileToEvaluasiAsesorWhenF03Complete(session.id);
    }

    return NextResponse.json({ message: "F03 berhasil disimpan" });
  } catch (error) {
    console.error("Error saving f03:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
