import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { Period } from "@/models/Period";
import { User } from "@/models/User";
import { RplSanggahan } from "@/models/RplSanggahan";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    await connectMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const periodId = searchParams.get("periodId");
    const search = searchParams.get("search")?.toLowerCase();
    const mahasiswaDecisionStatus = searchParams.get("mahasiswaDecisionStatus");
    const statusFinalisasi = searchParams.get("statusFinalisasi");
    const plenoStatus = searchParams.get("plenoStatus");

    // Fetch active period if no periodId specified
    let targetPeriodId = periodId;
    if (!targetPeriodId) {
      const activePeriod = await Period.findOne({ isActive: true }).lean();
      if (activePeriod) targetPeriodId = activePeriod._id.toString();
    }

    let query: any = {};
    if (targetPeriodId) query.periodId = targetPeriodId;
    if (mahasiswaDecisionStatus && mahasiswaDecisionStatus !== "Semua") query.mahasiswaDecisionStatus = mahasiswaDecisionStatus;
    if (statusFinalisasi && statusFinalisasi !== "Semua") query.statusFinalisasi = statusFinalisasi;
    if (plenoStatus && plenoStatus !== "Semua") query.plenoStatus = plenoStatus;

    const results = await RplFinalResult.find(query).populate("mahasiswaId", "name username").lean();

    // Attach active sanggahan data if needed
    const sanggahans = await RplSanggahan.find({
      finalResultId: { $in: results.map((r: any) => r._id) },
      status: { $in: ["SUBMITTED", "DITINDAKLANJUTI"] }
    }).lean();

    let finalData = results.map((r: any) => {
      let canFinalize = false;
      const sanggahanAktif = sanggahans.find((s: any) => s.finalResultId.toString() === r._id.toString());
      
      if (
        r.statusFinalisasi === "DRAFT" && 
        !sanggahanAktif && 
        (r.mahasiswaDecisionStatus === "DITERIMA" || r.mahasiswaDecisionStatus === "SANGGAHAN_SELESAI") &&
        r.recognizedCourses?.length > 0 && 
        r.totalSksDiakui > 0
      ) {
        canFinalize = true;
      }

      return {
        _id: r._id,
        mahasiswa: {
          _id: r.mahasiswaId?._id,
          name: r.mahasiswaId?.name,
          username: r.mahasiswaId?.username
        },
        periodId: r.periodId,
        totalSksTransfer: r.totalSksTransfer,
        totalSksPerolehan: r.totalSksPerolehan,
        totalSksDiakui: r.totalSksDiakui,
        mahasiswaDecisionStatus: r.mahasiswaDecisionStatus,
        statusFinalisasi: r.statusFinalisasi,
        plenoStatus: r.plenoStatus,
        statusSanggahan: sanggahanAktif ? sanggahanAktif.status : null,
        canFinalize
      };
    });

    if (search) {
      finalData = finalData.filter(d => 
        d.mahasiswa?.name?.toLowerCase().includes(search) || 
        d.mahasiswa?.username?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ data: finalData });
  } catch (error: any) {
    console.error("Error fetching finalisasi list:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
