import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { HasilPenilaianKonfirmasi } from "@/models/HasilPenilaianKonfirmasi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();

    // Ambil parameter filter
    const url = new URL(req.url);
    const filterKlasterId = url.searchParams.get("klasterId");
    const filterStatusPenilaian = url.searchParams.get("statusPenilaian");
    const filterStatusKonfirmasi = url.searchParams.get("statusKonfirmasi");
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    const plottings = await PenilaiPlotting.find({ status: { $ne: "Dibatalkan" } })
      .populate("mahasiswaId", "name username")
      .populate("klasterId", "namaKlaster")
      .populate("penilaiId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const result = [];

    // Gunakan map dengan Promise.all untuk fetch data pendukung
    for (const plot of plottings as any[]) {
      if (!plot.mahasiswaId || !plot.klasterId || !plot.penilaiId) continue;

      const mId = plot.mahasiswaId._id.toString();
      const kId = plot.klasterId._id.toString();

      // Filter by klaster if requested
      if (filterKlasterId && kId !== filterKlasterId) continue;

      // Filter by search
      if (search) {
        const studentName = plot.mahasiswaId.name?.toLowerCase() || "";
        const studentNim = plot.mahasiswaId.username?.toLowerCase() || "";
        if (!studentName.includes(search) && !studentNim.includes(search)) {
          continue;
        }
      }

      // Hitung progress penilaian
      // 1. Dapatkan semua matkul klaster ini
      const klasterMatkuls = await KlasterMatkul.find({ klasterId: kId }).lean();
      const allMatkulIds = klasterMatkuls.map((km: any) => km.matkulId.toString());

      // 2. Filter dari F02 (jika ada F02)
      const f02List = await F02Pengajuan.find({ userId: mId, matkulId: { $in: allMatkulIds } }).lean();
      const activeMatkulIds = f02List.length > 0 ? f02List.map((f: any) => f.matkulId.toString()) : allMatkulIds;

      const totalMatkul = activeMatkulIds.length;

      // 3. Ambil F03
      const f03List = await F03Evaluasi.find({
        userId: mId,
        klasterId: kId,
        courseId: { $in: activeMatkulIds }
      }).lean();

      let totalSudahDinilai = 0;
      let totalSebagian = 0;

      for (const mIdStr of activeMatkulIds) {
        const f03 = f03List.find((f: any) => f.courseId.toString() === mIdStr);
        if (f03) {
          const hasNilai = !!f03.nilaiHuruf;
          const hasVatm = f03.statusValidasi && f03.statusValidasi.length > 0;
          
          if (hasNilai && hasVatm) {
            totalSudahDinilai++;
          } else if (hasVatm || f03.catatanAsesor) {
            totalSebagian++;
          }
        }
      }

      let statusPenilaian = "Belum Dinilai";
      if (totalSudahDinilai === totalMatkul && totalMatkul > 0) {
        statusPenilaian = "Lengkap";
      } else if (totalSudahDinilai > 0 || totalSebagian > 0) {
        statusPenilaian = "Sebagian";
      }

      // Filter by status penilaian
      if (filterStatusPenilaian && filterStatusPenilaian !== statusPenilaian) continue;

      // Cek konfirmasi
      const konfirmasi = await HasilPenilaianKonfirmasi.findOne({
        mahasiswaId: mId,
        klasterId: kId,
        plottingId: plot._id
      }).lean() as any;

      const statusKonfirmasi = konfirmasi ? konfirmasi.status : "Belum Dikonfirmasi";

      // Filter by status konfirmasi
      if (filterStatusKonfirmasi && filterStatusKonfirmasi !== statusKonfirmasi) continue;

      result.push({
        plottingId: plot._id.toString(),
        mahasiswaId: mId,
        mahasiswaNama: plot.mahasiswaId.name,
        username: plot.mahasiswaId.username,
        klasterId: kId,
        klasterName: plot.klasterId.namaKlaster,
        penilaiId: plot.penilaiId._id.toString(),
        penilaiNama: plot.penilaiId.name,
        statusPlotting: plot.status,
        totalMatkul,
        totalSudahDinilai,
        totalBelumDinilai: totalMatkul - totalSudahDinilai,
        progressPenilaian: totalMatkul > 0 ? Math.round((totalSudahDinilai / totalMatkul) * 100) : 0,
        statusPenilaian,
        statusKonfirmasi,
        assignedAt: plot.assignedAt,
        updatedAt: plot.updatedAt
      });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("Error fetching hasil penilaian f03:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
