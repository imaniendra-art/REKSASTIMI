import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplFinalResult } from "@/models/RplFinalResult";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import { Klaster } from "@/models/Klaster";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");
    
    await connectMongoDB();
    
    let query: any = {};
    if (periodId) query.periodId = periodId;

    const results = await RplFinalResult.find(query)
      .populate({ path: "mahasiswaId", select: "name username", model: User })
      .populate({ path: "periodId", select: "namaPeriode tahunAkademik semester", model: Period })
      .populate({ path: "recognizedCourses.klasterId", select: "namaKlaster", model: Klaster })
      .populate({ path: "recognizedCourses.penilaiId", select: "name", model: User })
      .lean();

    const headers = [
      "Periode",
      "Nama Mahasiswa",
      "No Registrasi / Username / NIM",
      "Kode Mata Kuliah",
      "Nama Mata Kuliah",
      "SKS",
      "Jenis Rekognisi",
      "Nilai Huruf",
      "Nilai Angka",
      "Sumber",
      "Klaster",
      "Penilai"
    ];

    const rows: any[] = [];

    results.forEach((r: any) => {
      const periodStr = r.periodId?.namaPeriode || "";
      const mhsNameStr = r.mahasiswaId?.name || "";
      const mhsNimStr = r.mahasiswaId?.username || "";

      (r.recognizedCourses || []).forEach((c: any) => {
        rows.push([
          `"${periodStr}"`,
          `"${mhsNameStr}"`,
          `"${mhsNimStr}"`,
          `"${c.kode || ""}"`,
          `"${c.nama || ""}"`,
          c.sks || 0,
          `"${c.jenisRekognisi || ""}"`,
          `"${c.nilaiHuruf || ""}"`,
          c.nilaiAngka || 0,
          `"${c.sumber || "-"}"`,
          `"${c.klasterId?.namaKlaster || "-"}"`,
          `"${c.penilaiId?.name || "-"}"`
        ]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="detail_matkul_diakui_${new Date().getTime()}.csv"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
