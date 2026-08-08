import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplFinalResult } from "@/models/RplFinalResult";
import { RplSanggahan } from "@/models/RplSanggahan";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "mahasiswa") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();

    const results = await RplFinalResult.find({
      mahasiswaId: session.id,
      mahasiswaDecisionStatus: { $ne: "BELUM_DIKIRIM" }
    }).lean();

    if (results.length === 0) {
      return NextResponse.json({ message: "Hasil RPL Anda belum tersedia", data: null });
    }

    const sanggahans = await RplSanggahan.find({
      mahasiswaId: session.id,
      finalResultId: { $in: results.map((r: any) => r._id) }
    }).sort({ createdAt: -1 }).lean();

    const data = results.map((r: any) => ({
      ...r,
      sanggahanAktif: sanggahans.find((s: any) => s.finalResultId.toString() === r._id.toString() && ["SUBMITTED", "DITINDAKLANJUTI"].includes(s.status)),
      sanggahans: sanggahans.filter((s: any) => s.finalResultId.toString() === r._id.toString())
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error fetching mahasiswa hasil rpl:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
