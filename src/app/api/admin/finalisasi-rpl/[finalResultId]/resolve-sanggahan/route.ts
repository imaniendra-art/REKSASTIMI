import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSanggahan } from "@/models/RplSanggahan";

export async function POST(req: NextRequest, { params }: { params: Promise<{ finalResultId: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { finalResultId } = await params;
    await connectMongoDB();

    const body = await req.json();
    const { action, catatanAdmin } = body;

    const result = await RplFinalResult.findById(finalResultId);
    if (!result) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    const activeSanggahan = await RplSanggahan.findOne({
      finalResultId,
      status: { $in: ["SUBMITTED", "DITINDAKLANJUTI"] }
    });

    if (!activeSanggahan) {
      return NextResponse.json({ message: "Tidak ada sanggahan aktif untuk diselesaikan" }, { status: 400 });
    }

    if (action === "TERIMA_SANGGAHAN" || action === "TOLAK_SANGGAHAN") {
      activeSanggahan.status = action === "TERIMA_SANGGAHAN" ? "SELESAI" : "DITOLAK";
      activeSanggahan.catatanAdmin = catatanAdmin;
      activeSanggahan.resolvedBy = session.id;
      activeSanggahan.resolvedAt = new Date();
      await activeSanggahan.save();

      // If finished resolving, set final result status
      result.mahasiswaDecisionStatus = "SANGGAHAN_SELESAI";
      // We don't automatically set SIAP_PLENO here. Admin may need to re-send to student if changes are big.
      // But for simplicity, we let the frontend or another step decide.
      await result.save();
      
      return NextResponse.json({ message: "Sanggahan berhasil diselesaikan" });
    }

    return NextResponse.json({ message: "Aksi tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("Error resolve sanggahan:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
