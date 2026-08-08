import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplDocument } from "@/models/RplDocument";
import { Period } from "@/models/Period";
import { User } from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await connectMongoDB();

    const doc = await RplDocument.findOne({ verifiedToken: token })
      .populate({ path: "mahasiswaId", select: "name username", model: User })
      .populate({ path: "periodId", select: "name academicYear semester", model: Period });

    if (!doc) {
      return NextResponse.json({ success: false, message: "Dokumen tidak ditemukan atau token tidak valid." }, { status: 404 });
    }

    // Determine status text
    let statusValiditas = "VALID";
    let message = "Dokumen ini tercatat pada sistem REKSA STIMI.";

    if (doc.status === "REVISI" || !doc.isLatestVersion) {
      statusValiditas = "VALID - ARSIP LAMA";
      message = "Dokumen ini valid sebagai arsip versi lama. Terdapat versi terbaru pada sistem REKSA.";
    }

    return NextResponse.json({
      success: true,
      data: {
        statusValiditas,
        message,
        documentType: doc.documentType,
        documentNumber: doc.documentNumber || "-",
        title: doc.title || doc.documentType,
        mahasiswaName: doc.mahasiswaId?.name || null,
        mahasiswaIdentifier: doc.mahasiswaId?.username || null,
        periodName: doc.periodId ? `${doc.periodId.tahunAkademik} - ${doc.periodId.semester} (${doc.periodId.namaPeriode})` : null,
        version: doc.version,
        finalizedAt: doc.finalizedAt,
        status: doc.status
      }
    });

  } catch (error: any) {
    console.error("Error verify token:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
