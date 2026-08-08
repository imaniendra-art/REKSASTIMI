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
import { HasilPenilaianKonfirmasi } from "@/models/HasilPenilaianKonfirmasi";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ plottingId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
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

    const mId = (plotting as any).mahasiswaId;
    const kId = (plotting as any).klasterId;

    const student = await User.findById(mId).lean();
    const profile = await ApplicantProfile.findOne({ userId: mId }).lean();
    const klaster = await Klaster.findById(kId).lean();
    const penilai = await User.findById((plotting as any).penilaiId).lean();

    // Get all matkul for this klaster
    const klasterMatkuls = await KlasterMatkul.find({ klasterId: kId }).lean();
    const allMatkulIds = klasterMatkuls.map((km: any) => km.matkulId.toString());

    // Filter by F02
    const f02List = await F02Pengajuan.find({ userId: mId, matkulId: { $in: allMatkulIds } }).lean();
    const activeMatkulIds = f02List.length > 0 ? f02List.map((f: any) => f.matkulId.toString()) : allMatkulIds;

    const matkuls = await MataKuliah.find({ _id: { $in: activeMatkulIds } }).lean();

    // Get CPMK
    const { MatkulCpmk } = await import("@/models/MatkulCpmk");
    const cpmks = await MatkulCpmk.find({ matkulId: { $in: activeMatkulIds } }).lean();

    // Get F03 Evaluasi records
    const f03List = await F03Evaluasi.find({
      userId: mId,
      klasterId: kId,
      courseId: { $in: activeMatkulIds }
    }).lean();

    let totalSudahDinilai = 0;

    const coursesData = matkuls.map((m: any) => {
      const f03 = f03List.find((f: any) => f.courseId.toString() === m._id.toString());
      const mCpmks = cpmks
        .filter((c: any) => c.matkulId.toString() === m._id.toString())
        .sort((a: any, b: any) => a.nomorUrut - b.nomorUrut)
        .map((c: any) => `- ${c.deskripsi}`)
        .join("\n");
      
      const hasNilai = !!f03?.nilaiHuruf;
      const hasVatm = f03?.statusValidasi && f03.statusValidasi.length > 0;
      let status = "Belum Dinilai";
      
      if (hasNilai && hasVatm) {
        status = "Sudah Dinilai";
        totalSudahDinilai++;
      } else if (hasVatm || f03?.catatanAsesor) {
        status = "Sebagian";
      }

      return {
        matkulId: m._id.toString(),
        kode: m.kode,
        nama: m.namaMatkul,
        sks: m.sks,
        deskripsiMatkul: m.deskripsi || "Deskripsi mata kuliah belum tersedia.",
        cplCpmk: mCpmks || "CPL/CPMK belum diatur dalam sistem.",
        
        // Isian Mahasiswa
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
        status
      };
    });

    const konfirmasi = (await HasilPenilaianKonfirmasi.findOne({ plottingId }).lean()) as any;
    let confirmedByName = "";
    if (konfirmasi && konfirmasi.confirmedBy) {
        const confirmedByUser = await User.findById(konfirmasi.confirmedBy).lean();
        if (confirmedByUser) confirmedByName = confirmedByUser.name;
    }

    return NextResponse.json({
      data: {
        plotting,
        student: { 
          id: student?._id?.toString() || "", 
          name: student?.name || "", 
          username: student?.username || "", 
          concentration: profile?.concentration || "Belum dipilih" 
        },
        klaster: { 
          id: klaster?._id?.toString() || "", 
          name: klaster?.namaKlaster || "" 
        },
        penilai: {
          id: penilai?._id?.toString() || "",
          name: penilai?.name || ""
        },
        progress: {
            totalMatkul: activeMatkulIds.length,
            totalSudahDinilai,
            totalBelumDinilai: activeMatkulIds.length - totalSudahDinilai,
            percentage: activeMatkulIds.length > 0 ? Math.round((totalSudahDinilai / activeMatkulIds.length) * 100) : 0
        },
        konfirmasi: konfirmasi ? {
            status: konfirmasi.status,
            catatanAdmin: konfirmasi.catatanAdmin || "",
            confirmedAt: konfirmasi.confirmedAt,
            confirmedByName
        } : null,
        courses: coursesData
      }
    });

  } catch (error: any) {
    console.error("Error fetching admin monitoring f03 detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
