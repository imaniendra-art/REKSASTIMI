import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplSkDocument } from "@/models/RplSkDocument";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplDocument } from "@/models/RplDocument";
import { Period } from "@/models/Period";
import { User } from "@/models/User";
import { generateVerifiedToken } from "@/lib/document-token";

export async function GET(req: Request, { params }: { params: Promise<{ periodId: string }> }) {
  try {
    const { periodId } = await params;
    await connectMongoDB();

    const period = await Period.findById(periodId).lean();
    if (!period) throw new Error("Periode tidak ditemukan");

    // Get all SKs for this period
    const skDocs = await RplSkDocument.find({ periodId }).lean();
    
    // Get all Final Results for this period
    const finalResults = await RplFinalResult.find({ periodId }).populate("mahasiswaId", "name username", User).lean();

    // Get the Bundle Document for the Period
    const bundleDoc = await RplDocument.findOne({ periodId, documentType: "BUNDLE_PERIODE", isLatestVersion: true }).lean();

    return NextResponse.json({
      success: true,
      data: {
        period,
        skDocs,
        finalResults,
        bundleDoc
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ periodId: string }> }) {
  try {
    const { periodId } = await params;
    await connectMongoDB();

    let bundleDoc = await RplDocument.findOne({ periodId, documentType: "BUNDLE_PERIODE", isLatestVersion: true });

    if (bundleDoc && (bundleDoc.status === "FINAL" || bundleDoc.status === "ARSIP")) {
      return NextResponse.json({ message: "Bundle Periode ini sudah final/arsip. Harap buat versi baru (Revisi) jika diperlukan." }, { status: 400 });
    }

    if (!bundleDoc) {
       // Create metadata implicitly since we didn't have a button to generate metadata for period bundle yet
       const token = generateVerifiedToken();
       const period = await Period.findById(periodId).lean();
       bundleDoc = new RplDocument({
         periodId,
         documentType: "BUNDLE_PERIODE",
         title: "Bundle Arsip Periode RPL",
         documentNumber: `BUNDLE-PERIODE/REKSA/${period?.tahunAkademik || new Date().getFullYear()}`,
         status: "FINAL",
         verifiedToken: token,
         verifiedUrl: `/verify/dokumen/${token}`,
         version: 1,
         isLatestVersion: true,
         finalizedAt: new Date()
       });
       await bundleDoc.save();
    } else {
       bundleDoc.status = "FINAL";
       bundleDoc.finalizedAt = new Date();
       await bundleDoc.save();
    }

    return NextResponse.json({ success: true, message: "Bundle Periode berhasil difinalisasi.", token: bundleDoc.verifiedToken });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
