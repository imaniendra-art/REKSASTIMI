import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSkDocument } from "@/models/RplSkDocument";
import { User } from "@/models/User";
import { Period } from "@/models/Period";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");
    
    await connectMongoDB();
    
    let query: any = {};
    if (periodId) {
      query.periodId = periodId;
    }

    const results = await RplFinalResult.find(query)
      .populate({ path: "mahasiswaId", select: "name username", model: User })
      .populate({ path: "periodId", select: "namaPeriode tahunAkademik semester", model: Period })
      .populate({ path: "skHasilRplId", select: "skNumber", model: RplSkDocument })
      .populate({ path: "baPlenoSkId", select: "skNumber", model: RplSkDocument })
      .lean();

    // Generate CSV
    const headers = [
      "Periode",
      "Tahun Akademik",
      "Semester",
      "Nama Mahasiswa",
      "No Registrasi / Username / NIM",
      "Program Studi",
      "Jalur RPL",
      "Total SKS Transfer",
      "Total SKS Perolehan",
      "Total SKS Diakui",
      "Status Finalisasi",
      "Status Pleno",
      "Nomor SK Hasil",
      "Nomor BA Pleno"
    ];

    const rows = results.map((r: any) => [
      `"${r.periodId?.namaPeriode || ""}"`,
      `"${r.periodId?.tahunAkademik || ""}"`,
      `"${r.periodId?.semester || ""}"`,
      `"${r.mahasiswaId?.name || ""}"`,
      `"${r.mahasiswaId?.username || ""}"`,
      `"Manajemen"`, // default
      `"Tipe A"`, // default
      r.totalSksTransfer || 0,
      r.totalSksPerolehan || 0,
      r.totalSksDiakui || 0,
      `"${r.statusFinalisasi || ""}"`,
      `"${r.plenoStatus || ""}"`,
      `"${r.skHasilRplId?.skNumber || "-"}"`,
      `"${r.baPlenoSkId?.skNumber || "-"}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rekap_mahasiswa_rpl_${new Date().getTime()}.csv"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
