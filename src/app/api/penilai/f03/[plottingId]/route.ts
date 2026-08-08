import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ plottingId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "penilai") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { plottingId } = await params;
    if (!mongoose.Types.ObjectId.isValid(plottingId)) {
      return NextResponse.json({ message: "ID Plotting tidak valid" }, { status: 400 });
    }

    await connectMongoDB();

    const plotting = await PenilaiPlotting.findOne({ _id: plottingId, status: { $ne: "Dibatalkan" } }).lean();
    if (!plotting) {
      return NextResponse.json({ message: "Plotting tidak ditemukan" }, { status: 404 });
    }

    if ((plotting as any).penilaiId.toString() !== session.id) {
      return NextResponse.json({ message: "Akses ditolak: Data ini bukan plotting Anda" }, { status: 403 });
    }

    const student = await User.findById((plotting as any).mahasiswaId).lean();
    const profile = await ApplicantProfile.findOne({ userId: (plotting as any).mahasiswaId }).lean();
    const klaster = await Klaster.findById((plotting as any).klasterId).lean();

    // Get all matkul for this klaster
    const klasterMatkuls = await KlasterMatkul.find({ klasterId: (plotting as any).klasterId }).lean();
    const allMatkulIds = klasterMatkuls.map((km: any) => km.matkulId.toString());

    // Filter by F02 if applicable
    const f02List = await F02Pengajuan.find({ userId: (plotting as any).mahasiswaId, matkulId: { $in: allMatkulIds } }).lean();
    const activeMatkulIds = f02List.length > 0 ? f02List.map((f: any) => f.matkulId.toString()) : allMatkulIds;

    const matkuls = await MataKuliah.find({ _id: { $in: activeMatkulIds } }).lean();

    // Get CPMK
    const { MatkulCpmk } = await import("@/models/MatkulCpmk");
    const cpmks = await MatkulCpmk.find({ matkulId: { $in: activeMatkulIds } }).lean();

    // Get F03 Evaluasi records
    const f03List = await F03Evaluasi.find({
      userId: (plotting as any).mahasiswaId,
      klasterId: (plotting as any).klasterId,
      courseId: { $in: activeMatkulIds }
    }).lean();

    const coursesData = matkuls.map((m: any) => {
      const f03 = f03List.find((f: any) => f.courseId.toString() === m._id.toString());
      const mCpmks = cpmks
        .filter((c: any) => c.matkulId.toString() === m._id.toString())
        .sort((a: any, b: any) => a.nomorUrut - b.nomorUrut)
        .map((c: any) => `- ${c.deskripsi}`)
        .join("\n");
      
      return {
        matkulId: m._id.toString(),
        kode: m.kode,
        nama: m.namaMatkul,
        sks: m.sks,
        deskripsiMatkul: m.deskripsi || "Deskripsi mata kuliah belum tersedia.",
        cplCpmk: mCpmks || "CPL/CPMK belum diatur dalam sistem.",
        // Isian Mahasiswa
        f03EvaluasiId: f03?._id?.toString() || null,
        tingkatKemampuan: f03?.tingkatKemampuan || null,
        jenisBukti: f03?.jenisBukti || [],
        buktiFileUrl: f03?.buktiFileUrl || null,
        // Hasil Penilaian
        statusValidasi: f03?.statusValidasi || [],
        nilaiHuruf: f03?.nilaiHuruf || null,
        catatanPenilai: f03?.catatanAsesor || "",
        tanggalPenilaian: f03?.tanggalPenilaian ? new Date(f03.tanggalPenilaian).toISOString().split('T')[0] : "",
        waktuPenilaian: f03?.waktuPenilaian || "",
        lokasiPenilaian: f03?.lokasiPenilaian || "",
        penilai1: f03?.penilai1 || "",
        penilai2: f03?.penilai2 || "",
        status: (f03?.nilaiHuruf && f03?.statusValidasi && f03.statusValidasi.length > 0) ? "Sudah Dinilai" : 
                (f03?.catatanAsesor || (f03?.statusValidasi && f03.statusValidasi.length > 0)) ? "Sebagian" : "Belum Dinilai"
      };
    });

    return NextResponse.json({
      data: {
        plotting,
        student: { id: student?._id?.toString() || "", name: student?.name || "", username: student?.username || "", concentration: profile?.concentration || "Belum dipilih" },
        klaster: { id: klaster?._id?.toString() || "", name: klaster?.namaKlaster || "" },
        courses: coursesData
      }
    });

  } catch (error: any) {
    console.error("Error fetching penilai f03 detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
