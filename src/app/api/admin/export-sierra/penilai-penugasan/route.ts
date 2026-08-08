import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import { Klaster } from "@/models/Klaster";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { RplPeriodPenilai } from "@/models/RplPeriodPenilai";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");
    
    await connectMongoDB();
    
    let query: any = {};
    let period: any = null;
    let periodPenilai: any[] = [];
    if (periodId) {
      period = await Period.findById(periodId).lean();
      const profiles = await ApplicantProfile.find({ periodId }).select("userId").lean();
      query.mahasiswaId = { $in: profiles.map((p: any) => p.userId) };
      periodPenilai = await RplPeriodPenilai.find({ periodId, isActive: true }).lean();
    }

    const plottings = await PenilaiPlotting.find(query)
      .populate({ path: "penilaiId", select: "name", model: User })
      .populate({ path: "mahasiswaId", select: "name username", model: User })
      .populate({ path: "klasterId", select: "namaKlaster", model: Klaster })
      .lean();

    // Map penilai to count
    const summary: Record<string, any> = {};

    plottings.forEach((p: any) => {
      if (!p.penilaiId) return;
      
      const key = `${p.penilaiId._id}_${p.klasterId?._id}`;
      const periodPenilaiMatch = periodPenilai.find((pp: any) =>
        pp.penilaiId.toString() === p.penilaiId._id.toString() &&
        pp.klasterIds.some((klasterId: any) => klasterId.toString() === p.klasterId?._id?.toString())
      );
      if (!summary[key]) {
        summary[key] = {
          periode: period?.namaPeriode || "-",
          namaPenilai: p.penilaiId.name,
          jenisPenilai: periodPenilaiMatch?.jenisPenilai || "Penilai",
          klaster: p.klasterId?.namaKlaster || "-",
          jumlahMhs: 0,
          noSkPenilai: "-", // Can fetch if needed
          noSkPenugasan: "-" // Can fetch if needed
        };
      }
      summary[key].jumlahMhs += 1;
    });

    const headers = [
      "Periode",
      "Nama Penilai",
      "Jenis Penilai",
      "Klaster",
      "Jumlah Mahasiswa Ditugaskan",
      "Nomor SK Penilai",
      "Nomor SK Penugasan"
    ];

    const rows = Object.values(summary).map(s => [
      `"${s.periode}"`,
      `"${s.namaPenilai}"`,
      `"${s.jenisPenilai}"`,
      `"${s.klaster}"`,
      s.jumlahMhs,
      `"${s.noSkPenilai}"`,
      `"${s.noSkPenugasan}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="penilai_penugasan_${new Date().getTime()}.csv"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
