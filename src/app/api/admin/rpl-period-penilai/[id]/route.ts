import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplPeriodPenilai } from "@/models/RplPeriodPenilai";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    // Prevent direct manipulation of eligibility if not from finalize
    if ("isEligibleForPlotting" in body) {
      delete body.isEligibleForPlotting;
    }

    await connectMongoDB();
    const updated = await RplPeriodPenilai.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ message: "Data penilai periode berhasil diupdate", data: updated });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;

    await connectMongoDB();
    
    // Check if SK is already finalized. If yes, prevent hard delete or warn. 
    // For simplicity, we just delete.
    await RplPeriodPenilai.findByIdAndDelete(id);

    return NextResponse.json({ message: "Penilai berhasil dihapus dari periode" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
