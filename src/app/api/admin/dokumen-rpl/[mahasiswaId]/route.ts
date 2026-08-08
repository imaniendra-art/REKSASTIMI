import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { RplDocument } from "@/models/RplDocument";
import { RplFinalResult } from "@/models/RplFinalResult";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import { PenilaiProfile } from "@/models/PenilaiProfile";
import { DOCUMENT_TYPES, DOCUMENT_LABELS, checkReadiness, DocumentType } from "@/lib/rpl-documents";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mahasiswaId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { mahasiswaId } = await params;
    if (!mongoose.Types.ObjectId.isValid(mahasiswaId)) {
      return NextResponse.json({ message: "ID Mahasiswa tidak valid" }, { status: 400 });
    }

    await connectMongoDB();

    const student = await User.findById(mahasiswaId).lean();
    if (!student || student.role !== "mahasiswa") {
      return NextResponse.json({ message: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    const profile = await ApplicantProfile.findOne({ userId: mahasiswaId }).lean();
    const period = profile?.periodId ? await Period.findById(profile.periodId).lean() : null;

    // Check F02
    const f02Count = await F02Pengajuan.countDocuments({ userId: mahasiswaId });
    const f02Exists = f02Count > 0;

    // Check F03
    const isF03Confirmed = profile?.statusRpl === "KONFIRMASI_HASIL" || profile?.progress?.resultStatus === "KONFIRMASI" || profile?.statusRpl === "SIAP_PLENO" || profile?.statusRpl === "LULUS";
    
    // Check Penilai
    const plottings = await PenilaiPlotting.find({ mahasiswaId, status: { $ne: "Dibatalkan" } }).lean();
    const penilaiIds = plottings.map((p: any) => p.penilaiId);
    const penilaiProfilesExist = penilaiIds.length > 0 ? (await PenilaiProfile.countDocuments({ userId: { $in: penilaiIds } })) > 0 : false;

    // Sanggahan Status (For MVP, we use false unless defined)
    const sanggahanAccepted = false; // TODO: Implement Mhs acceptance flow

    // Final Result Status
    const finalResult = (await RplFinalResult.findOne({ mahasiswaId }).lean()) as any;
    const finalResultStatus = finalResult ? finalResult.statusFinalisasi : null;

    // Fetch existing generated documents
    const existingDocs = await RplDocument.find({ mahasiswaId }).lean();

    const documentList = [];
    let allRequiredReadyForBundle = true;

    for (const docType of DOCUMENT_TYPES) {
      if (docType === "BUNDLE") continue; // We process bundle last

      const existingDoc = existingDocs.find((d: any) => d.documentType === docType);
      
      const readiness = checkReadiness(
        docType,
        profile,
        f02Exists,
        isF03Confirmed,
        penilaiProfilesExist,
        sanggahanAccepted,
        finalResultStatus
      );

      if (!readiness.isReady) {
        allRequiredReadyForBundle = false;
      }

      const status = existingDoc ? existingDoc.status : (readiness.isReady ? "Siap Cetak" : "Belum Siap");

      documentList.push({
        documentType: docType,
        label: DOCUMENT_LABELS[docType],
        status,
        documentNumber: existingDoc?.documentNumber || null,
        manualNumberOverride: existingDoc?.manualNumberOverride || false,
        readiness: readiness.isReady,
        reason: readiness.reason,
        canPreview: status !== "Belum Siap",
        canPrint: status !== "Belum Siap",
        existingRplDocument: existingDoc || null
      });
    }

    // Now process BUNDLE
    const bundleDoc = existingDocs.find((d: any) => d.documentType === "BUNDLE");
    const bundleReadiness = checkReadiness("BUNDLE", null, false, false, false, false, null, allRequiredReadyForBundle);
    const bundleStatus = bundleDoc ? bundleDoc.status : (bundleReadiness.isReady ? "Siap Cetak" : "Belum Siap");

    documentList.push({
      documentType: "BUNDLE",
      label: DOCUMENT_LABELS["BUNDLE"],
      status: bundleStatus,
      documentNumber: bundleDoc?.documentNumber || null,
      manualNumberOverride: bundleDoc?.manualNumberOverride || false,
      readiness: bundleReadiness.isReady,
      reason: bundleReadiness.reason,
      canPreview: bundleStatus !== "Belum Siap",
      canPrint: bundleStatus !== "Belum Siap",
      existingRplDocument: bundleDoc || null
    });

    return NextResponse.json({
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          username: student.username
        },
        profile: profile ? {
            statusRpl: profile.statusRpl,
            progressResultStatus: profile.progress?.resultStatus
        } : null,
        period: period ? {
            name: period.namaPeriode,
            year: period.tahunAkademik ? parseInt(period.tahunAkademik.split("/")[0]) : new Date().getFullYear()
        } : null,
        documents: documentList,
        summary: {
            f02Exists,
            isF03Confirmed,
            penilaiProfilesExist,
            sanggahanAccepted,
            finalResultStatus
        }
      }
    });

  } catch (error: any) {
    console.error("Error fetching detail dokumen RPL:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
