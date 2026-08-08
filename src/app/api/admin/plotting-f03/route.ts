import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { Period } from "@/models/Period";
import { RplSkDocument } from "@/models/RplSkDocument";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { assertPenilaiEligible } from "@/lib/penilai-eligibility";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const filterKlasterId = searchParams.get("klasterId");
    const filterStatusPlotting = searchParams.get("statusPlotting"); // "Belum Diplotting" | "Sudah Diplotting"
    const search = searchParams.get("search")?.toLowerCase();

    // 1. Fetch all assessment attempts that are Completed
    let attemptQuery: any = { status: "Completed" };
    if (filterKlasterId) {
      attemptQuery.klasterId = filterKlasterId;
    }
    const attempts = await AssessmentAttempt.find(attemptQuery).lean();

    // 2. Fetch all F03Evaluasi to count them
    let f03Query: any = {};
    if (filterKlasterId) {
      f03Query.klasterId = filterKlasterId;
    }
    const allF03 = await F03Evaluasi.find(f03Query).lean();

    // 3. Fetch all KlasterMatkul and F02Pengajuan
    const allKlasterMatkul = await KlasterMatkul.find(filterKlasterId ? { klasterId: filterKlasterId } : {}).lean();
    const allF02 = await F02Pengajuan.find().lean();

    // 4. Fetch Plottings
    let plottingQuery: any = {};
    if (filterKlasterId) {
      plottingQuery.klasterId = filterKlasterId;
    }
    const plottings = await PenilaiPlotting.find(plottingQuery).lean();

    // 5. Fetch all related users
    const userIds = attempts.map(a => a.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    const penilaiIds = plottings.map(p => p.penilaiId);
    const penilaiUsers = await User.find({ _id: { $in: penilaiIds } }).lean();

    const klasters = await Klaster.find(filterKlasterId ? { _id: filterKlasterId } : {}).lean();

    const results = [];

    for (const attempt of attempts) {
      const student = users.find(u => u._id.toString() === attempt.userId.toString());
      if (!student) continue;

      // Apply search filter if any
      if (search) {
        const nameMatch = student.name?.toLowerCase().includes(search);
        const usernameMatch = student.username?.toLowerCase().includes(search);
        if (!nameMatch && !usernameMatch) continue;
      }

      const klaster = klasters.find(k => k._id.toString() === attempt.klasterId.toString());
      if (!klaster) continue;

      // Calculate F03 Status
      // F02 determines the matkul that the student actually requested for this klaster
      const klasterMatkulIds = allKlasterMatkul
        .filter(km => km.klasterId.toString() === attempt.klasterId.toString())
        .map(km => km.matkulId.toString());

      const f02MatkulIdsForStudent = allF02
        .filter(f => f.userId.toString() === attempt.userId.toString() && klasterMatkulIds.includes(f.matkulId.toString()))
        .map(f => f.matkulId.toString());

      const requiredCount = f02MatkulIdsForStudent.length > 0 ? f02MatkulIdsForStudent.length : klasterMatkulIds.length;

      const studentF03 = allF03.filter(
        f => f.userId.toString() === attempt.userId.toString() && f.klasterId.toString() === attempt.klasterId.toString()
      );

      let f03Status = "Belum Diisi";
      if (studentF03.length > 0) {
        f03Status = "Sebagian";
        const isCountComplete = studentF03.length >= requiredCount;
        
        // Check minimal fields
        let minimalFieldsComplete = true;
        for (const f03 of studentF03) {
          if (!f03.tingkatKemampuan || f03.jenisBukti.length === 0 || !f03.buktiFileUrl) {
            minimalFieldsComplete = false;
            break;
          }
        }

        if (isCountComplete && minimalFieldsComplete) {
          f03Status = "Lengkap";
        }
      }

      // Plotting Status
      const plotting = plottings.find(
        p => p.mahasiswaId.toString() === attempt.userId.toString() && p.klasterId.toString() === attempt.klasterId.toString() && p.status === "Aktif"
      );

      const statusPlottingText = plotting ? "Sudah Diplotting" : "Belum Diplotting";

      if (filterStatusPlotting && filterStatusPlotting !== "Semua") {
        if (filterStatusPlotting !== statusPlottingText) continue;
      }

      let penilaiNama = "-";
      let penilaiId = null;
      if (plotting) {
        const pUser = penilaiUsers.find(u => u._id.toString() === plotting.penilaiId.toString());
        if (pUser) {
          penilaiNama = pUser.name;
          penilaiId = pUser._id.toString();
        }
      }

      results.push({
        plottingId: plotting ? (plotting as any)._id.toString() : undefined,
        mahasiswaId: student._id.toString(),
        mahasiswaNama: student.name,
        username: student.username,
        klasterId: klaster._id.toString(),
        klasterName: klaster.namaKlaster,
        assessmentStatus: attempt.status,
        certificateNumber: attempt.certificateNumber || null,
        f03Status,
        plottingStatus: statusPlottingText,
        penilaiId,
        penilaiNama,
        assignedAt: plotting?.assignedAt || null,
      });
    }

    // Check SK Penilai
    const activePeriod = await Period.findOne({ isActive: true }).lean();
    let isSkFinal = false;
    if (activePeriod) {
      const sk = await RplSkDocument.findOne({ periodId: activePeriod._id, skType: "SK_PENILAI_RPL", status: "FINAL" }).lean();
      if (sk) isSkFinal = true;
    }

    return NextResponse.json({ data: results, isSkFinal });
  } catch (error: any) {
    console.error("Error fetching plotting F03:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();
    const body = await req.json();
    const { mahasiswaId, klasterId, penilaiId, catatanAdmin } = body;

    if (!mahasiswaId || !klasterId || !penilaiId) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Tentukan periode legal plotting: profil mahasiswa lebih kuat daripada periode aktif.
    const activePeriod = await Period.findOne({ isActive: true }).lean();
    const applicantProfile = await ApplicantProfile.findOne({ userId: mahasiswaId }).lean();
    const periodIdForPlotting = applicantProfile?.periodId?.toString() || activePeriod?._id?.toString();
    if (!periodIdForPlotting) {
      return NextResponse.json({ message: "Tidak ada periode aktif" }, { status: 400 });
    }

    // 2. Verify Mahasiswa completed Assessment
    const attempt = await AssessmentAttempt.findOne({ userId: mahasiswaId, klasterId, status: "Completed" }).lean();
    if (!attempt) {
      return NextResponse.json({ message: "Mahasiswa belum menyelesaikan Tes Kompetensi pada klaster ini" }, { status: 400 });
    }

    // 3. Verify Penilai Eligibility via Shared Helper
    try {
      await assertPenilaiEligible({
        periodId: periodIdForPlotting,
        klasterId: klasterId,
        penilaiId: penilaiId
      });
    } catch (err: any) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    // 3. Upsert Plotting
    // We update existing or insert new.
    // However, since we might have cancelled ones, we just search for the unique compound index.
    const plotting = await PenilaiPlotting.findOneAndUpdate(
      { mahasiswaId, klasterId },
      {
        $set: {
          penilaiId,
          assignedBy: session.id,
          catatanAdmin: catatanAdmin || "",
          assignmentMode: "Manual",
          status: "Aktif",
          assignedAt: new Date(),
          cancelledAt: null,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Plotting berhasil disimpan", data: plotting });
  } catch (error: any) {
    console.error("Error saving plotting:", error);
    if (error.code === 11000) {
      return NextResponse.json({ message: "Gagal menyimpan: Duplikasi plotting" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
