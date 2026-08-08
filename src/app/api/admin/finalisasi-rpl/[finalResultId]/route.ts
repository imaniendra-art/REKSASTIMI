import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSanggahan } from "@/models/RplSanggahan";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId } = await params;
    await connectMongoDB();

    const result = await RplFinalResult.findById(finalResultId).populate("mahasiswaId", "name username").lean();
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    const sanggahans = await RplSanggahan.find({ finalResultId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ data: { ...result, sanggahans } });
  } catch (error: any) {
    console.error("Error fetching finalisasi detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId } = await params;
    await connectMongoDB();

    const result = await RplFinalResult.findById(finalResultId);
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    if (result.statusFinalisasi === "FINAL") {
      return NextResponse.json({ message: "Hasil sudah FINAL, tidak dapat diubah" }, { status: 400 });
    }

    const body = await req.json();
    const { recognizedCourses, catatanAdmin } = body;

    if (recognizedCourses) {
      result.recognizedCourses = recognizedCourses;
      // Recalculate totals
      let tTransfer = 0;
      let tPerolehan = 0;
      for (const rc of recognizedCourses) {
        if (rc.jenisRekognisi === "Transfer SKS") tTransfer += (rc.sks || 0);
        if (rc.jenisRekognisi === "Perolehan SKS") tPerolehan += (rc.sks || 0);
      }
      result.totalSksTransfer = tTransfer;
      result.totalSksPerolehan = tPerolehan;
      result.totalSksDiakui = tTransfer + tPerolehan;

      // If already accepted, return to waiting response
      if (result.mahasiswaDecisionStatus === "DITERIMA") {
        result.mahasiswaDecisionStatus = "MENUNGGU_RESPON";
        // maybe add a note that data changed
      }
    }

    if (catatanAdmin !== undefined) result.catatanAdmin = catatanAdmin;

    await result.save();

    return NextResponse.json({ message: "Draf berhasil diperbarui", data: result });
  } catch (error: any) {
    console.error("Error updating finalisasi draft:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
