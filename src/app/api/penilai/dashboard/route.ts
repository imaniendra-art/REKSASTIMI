import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { Period } from "@/models/Period";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "penilai") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const filterKlasterId = searchParams.get("klasterId");
    const filterStatus = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    // Fetch all active plottings for this penilai
    let query: any = { penilaiId: session.id, status: { $ne: "Dibatalkan" } };
    if (filterKlasterId) {
      query.klasterId = filterKlasterId;
    }
    const plottings = await PenilaiPlotting.find(query).lean();

    if (plottings.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const mhsIds = plottings.map(p => p.mahasiswaId);
    const klasterIds = plottings.map(p => p.klasterId);

    const users = await User.find({ _id: { $in: mhsIds } }).lean();
    const klasters = await Klaster.find({ _id: { $in: klasterIds } }).lean();
    
    // Certificates and Pretest
    const attempts = await AssessmentAttempt.find({ userId: { $in: mhsIds }, status: "Completed" }).lean();
    
    // Fetch related KlasterMatkul and F02
    const allKlasterMatkul = await KlasterMatkul.find({ klasterId: { $in: klasterIds } }).lean();
    const allF02 = await F02Pengajuan.find({ userId: { $in: mhsIds } }).lean();
    
    // Fetch all F03 related to these students and klasters
    const allF03 = await F03Evaluasi.find({ userId: { $in: mhsIds }, klasterId: { $in: klasterIds } }).lean();

    const results = [];

    for (const plotting of plottings) {
      const student = users.find(u => u._id.toString() === plotting.mahasiswaId.toString());
      if (!student) continue;

      if (search) {
        const nameMatch = student.name?.toLowerCase().includes(search);
        const usernameMatch = student.username?.toLowerCase().includes(search);
        if (!nameMatch && !usernameMatch) continue;
      }

      const klaster = klasters.find(k => k._id.toString() === plotting.klasterId.toString());
      if (!klaster) continue;

      const attempt = attempts.find(a => a.userId.toString() === plotting.mahasiswaId.toString() && a.klasterId.toString() === plotting.klasterId.toString());

      // Count Matkul
      const klasterMatkulIds = allKlasterMatkul
        .filter(km => km.klasterId.toString() === plotting.klasterId.toString())
        .map(km => km.matkulId.toString());

      const f02MatkulIdsForStudent = allF02
        .filter(f => f.userId.toString() === plotting.mahasiswaId.toString() && klasterMatkulIds.includes(f.matkulId.toString()))
        .map(f => f.matkulId.toString());

      const requiredCount = f02MatkulIdsForStudent.length > 0 ? f02MatkulIdsForStudent.length : klasterMatkulIds.length;

      const studentF03 = allF03.filter(
        f => f.userId.toString() === plotting.mahasiswaId.toString() && f.klasterId.toString() === plotting.klasterId.toString()
      );

      // F03 Status calculation (Lengkap / Sebagian / Belum Diisi)
      let f03Status = "Belum Diisi";
      if (studentF03.length > 0) {
        f03Status = "Sebagian";
        const isCountComplete = studentF03.length >= requiredCount;
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

      // Evaluation Progress
      let totalSudahDinilai = 0;
      for (const f03 of studentF03) {
        if (f03.nilaiHuruf && f03.statusValidasi && f03.statusValidasi.length > 0) {
          totalSudahDinilai++;
        }
      }

      // Filter by progress status
      let evaluationProgress = "Menunggu Penilaian";
      if (totalSudahDinilai === requiredCount && requiredCount > 0) {
        evaluationProgress = "Selesai Dinilai";
      } else if (totalSudahDinilai > 0) {
        evaluationProgress = "Sebagian Dinilai";
      }

      if (filterStatus && filterStatus !== "Semua") {
        if (filterStatus !== evaluationProgress) continue;
      }

      results.push({
        plottingId: (plotting as any)._id.toString(),
        mahasiswaId: student._id.toString(),
        mahasiswaNama: student.name,
        username: student.username,
        klasterId: klaster._id.toString(),
        klasterName: klaster.namaKlaster,
        statusPlotting: plotting.status,
        f03Status,
        evaluationProgress,
        totalMatkul: requiredCount,
        totalSudahDinilai,
        totalBelumDinilai: requiredCount - totalSudahDinilai,
        assignedAt: plotting.assignedAt,
        certificateNumber: attempt?.certificateNumber || null
      });
    }

    // Fetch active period
    const activePeriod = await Period.findOne({ isActive: true }).lean();
    const activePeriodName = activePeriod ? activePeriod.namaPeriode : "Tidak ada periode aktif";

    return NextResponse.json({ 
      data: results,
      activePeriod: activePeriodName
    });
  } catch (error: any) {
    console.error("Error fetching penilai dashboard:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
