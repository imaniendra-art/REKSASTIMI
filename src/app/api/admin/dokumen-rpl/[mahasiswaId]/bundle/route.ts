import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { RplFinalResult } from "@/models/RplFinalResult";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { RplDocument } from "@/models/RplDocument";

export async function GET(req: Request, { params }: { params: Promise<{ mahasiswaId: string }> }) {
  try {
    const { mahasiswaId } = await params;
    await connectMongoDB();

    const student = await User.findById(mahasiswaId).lean();
    if (!student) throw new Error("Mahasiswa tidak ditemukan");

    const profile = await ApplicantProfile.findOne({ userId: mahasiswaId }).populate("periodId").lean();
    
    // Fetch all final docs for this student
    const finalDocs = await RplDocument.find({ mahasiswaId, isLatestVersion: true }).lean();
    const bundleDoc = finalDocs.find((d:any) => d.documentType === "BUNDLE");

    // Gather academic result
    const finalResult = await RplFinalResult.findOne({ mahasiswaId }).lean();
    
    // Gather plotting
    const plottings = await PenilaiPlotting.find({ mahasiswaId }).populate("penilaiId").populate("klasterId").lean();

    return NextResponse.json({
      success: true,
      data: {
        student,
        profile,
        finalResult,
        plottings,
        documents: finalDocs,
        bundleDoc
      }
    });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ mahasiswaId: string }> }) {
  try {
    const { mahasiswaId } = await params;
    await connectMongoDB();

    let bundleDoc = await RplDocument.findOne({ mahasiswaId, documentType: "BUNDLE", isLatestVersion: true });
    
    if (bundleDoc && (bundleDoc.status === "FINAL" || bundleDoc.status === "ARSIP")) {
       // Cannot overwrite
       return NextResponse.json({ message: "Bundle sudah FINAL/ARSIP. Harap buat versi baru (Revisi) dari panel sebelumnya." }, { status: 400 });
    }

    if (!bundleDoc) {
       // Should have been generated metadata, but just in case
       return NextResponse.json({ message: "Metadata BUNDLE belum di-generate." }, { status: 400 });
    }

    // Mark as final
    bundleDoc.status = "FINAL";
    bundleDoc.finalizedAt = new Date();
    await bundleDoc.save();

    return NextResponse.json({ success: true, message: "Bundle berhasil difinalisasi." });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
