import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkDocument } from "@/models/RplSkDocument";
import { RplPeriodPenilai } from "@/models/RplPeriodPenilai";
import { RplPeriodTeam } from "@/models/RplPeriodTeam";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;

    await connectMongoDB();

    const sk = await RplSkDocument.findById(id);
    if (!sk) return NextResponse.json({ message: "SK tidak ditemukan" }, { status: 404 });

    if (sk.status === "FINAL") {
      return NextResponse.json({ message: "SK sudah difinalisasi" }, { status: 400 });
    }

    // --- Backend Validation Gates ---
    if (!sk.skNumber || sk.skNumber === "-") {
      return NextResponse.json({ message: "Nomor SK wajib diisi dan tidak boleh default strip (-)." }, { status: 400 });
    }
    if (!sk.title || sk.title.trim() === "") {
      return NextResponse.json({ message: "Judul SK wajib diisi." }, { status: 400 });
    }
    // Validation for Tim Pengelola
    if (sk.skType === "SK_PENGELOLA_RPL") {
      const teamCount = await RplPeriodTeam.countDocuments({ periodId: sk.periodId, isActive: true });
      if (teamCount === 0) {
        return NextResponse.json({ message: "Gagal Finalisasi: Tim Pengelola periode ini belum memiliki anggota aktif." }, { status: 400 });
      }
    }
    // Validation for Penilai
    if (sk.skType === "SK_PENILAI_RPL") {
      const penilaiList = await RplPeriodPenilai.find({ periodId: sk.periodId, isActive: true }).lean();
      if (penilaiList.length === 0) {
        return NextResponse.json({ message: "Gagal Finalisasi: Daftar Penilai untuk periode ini kosong." }, { status: 400 });
      }
      for (const p of penilaiList) {
        if (!p.klasterIds || p.klasterIds.length === 0) {
          return NextResponse.json({ message: "Gagal Finalisasi: Terdapat penilai yang belum dipetakan ke Klaster Keahlian satupun." }, { status: 400 });
        }
      }
    }

    // Mark as Final
    sk.status = "FINAL";
    sk.finalizedBy = session.id as any;
    sk.finalizedAt = new Date();
    sk.effectiveDate = sk.effectiveDate || new Date();
    
    // For now we store a simple string or JSON for snapshot
    sk.dataSnapshot = {
        title: sk.title,
        skNumber: sk.skNumber,
        menimbang: sk.konsideranMenimbang,
        mengingat: sk.dasarHukum,
        menetapkan: sk.diktumMenetapkan,
        signers: sk.signers
    };

    await sk.save();

    // Trigger Side Effects based on skType
    if (sk.skType === "SK_PENILAI_RPL") {
        await RplPeriodPenilai.updateMany(
            { periodId: sk.periodId, isActive: true },
            { $set: { skDocumentId: sk._id, isEligibleForPlotting: true } }
        );
    } else if (sk.skType === "SK_PENGELOLA_RPL") {
        await RplPeriodTeam.updateMany(
            { periodId: sk.periodId, isActive: true },
            { $set: { skDocumentId: sk._id } }
        );
    }

    return NextResponse.json({ message: "SK berhasil difinalisasi", data: sk });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
