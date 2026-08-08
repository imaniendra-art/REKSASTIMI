import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplDocument } from "@/models/RplDocument";
import { ApplicantProfile } from "@/models/ApplicantProfile";

import { generateVerifiedToken } from "@/lib/document-token";

const titleByDocumentType: Record<string, string> = {
  F01: "Formulir F01",
  F02: "Formulir F02",
  F03: "Formulir F03",
  F04: "Biodata Penilai",
  F05: "Biodata Penilai",
  F07: "Surat Pernyataan Hasil RPL",
  SANGGAHAN: "Surat Sanggahan/Penerimaan Hasil RPL",
  BA_PLENO: "Berita Acara Pleno",
  SK_HASIL: "SK Hasil RPL",
  LAMPIRAN_KONVERSI: "Lampiran Nilai Transfer/Konversi",
  BUNDLE: "Bundle Arsip Final Mahasiswa",
  BUNDLE_PERIODE: "Bundle Arsip Periode"
};

export async function POST(req: Request, { params }: { params: Promise<{ mahasiswaId: string }> }) {
  try {
    const { mahasiswaId } = await params;
    const body = await req.json();
    const { documentType } = body;
    
    if (!documentType) return NextResponse.json({ message: "Invalid type" }, { status: 400 });

    await connectMongoDB();
    const profile = await ApplicantProfile.findOne({ userId: mahasiswaId }).lean();
    const token = generateVerifiedToken();
    const documentNumber = `${documentType}/REKSA/${new Date().getFullYear()}/${mahasiswaId.slice(-6).toUpperCase()}`;
    const verifiedUrl = `/verify/dokumen/${token}`;

    // Find existing to determine versioning
    let latestDoc = await RplDocument.findOne({ mahasiswaId, documentType }).sort({ version: -1 });

    if (latestDoc && (latestDoc.status === "FINAL" || latestDoc.status === "ARSIP")) {
      return NextResponse.json({ message: "Dokumen ini sudah final/arsip dan tidak dapat ditimpa. Gunakan fitur Buat Versi Baru jika diperlukan revisi." }, { status: 400 });
    }

    if (latestDoc && (latestDoc.status === "DRAFT" || latestDoc.status === "SIAP_CETAK")) {
      // Just update it and say SIAP_CETAK
      latestDoc.status = "SIAP_CETAK";
      latestDoc.periodId = latestDoc.periodId || profile?.periodId;
      latestDoc.title = latestDoc.title || titleByDocumentType[documentType] || documentType;
      latestDoc.documentNumber = latestDoc.documentNumber || documentNumber;
      if (!latestDoc.verifiedToken) latestDoc.verifiedToken = token;
      latestDoc.verifiedUrl = latestDoc.verifiedUrl || `/verify/dokumen/${latestDoc.verifiedToken}`;
      await latestDoc.save();
      return NextResponse.json({ success: true, documentNumber: latestDoc.documentNumber || "Draft" });
    }

    // Creating new if doesn't exist
    const newDoc = new RplDocument({
      mahasiswaId,
      periodId: profile?.periodId,
      documentType,
      title: titleByDocumentType[documentType] || documentType,
      documentNumber,
      status: "SIAP_CETAK",
      verifiedToken: token,
      verifiedUrl,
      version: 1,
      isLatestVersion: true
    });
    await newDoc.save();

    return NextResponse.json({ success: true, documentNumber: "Draft" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
