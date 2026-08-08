import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { PenilaiPlotting } from "@/models/PenilaiPlotting";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID Plotting tidak valid" }, { status: 400 });
    }

    await connectMongoDB();

    const plotting = await PenilaiPlotting.findById(id);
    if (!plotting) {
      return NextResponse.json({ message: "Plotting tidak ditemukan" }, { status: 404 });
    }

    plotting.status = "Dibatalkan";
    plotting.cancelledAt = new Date();
    await plotting.save();

    return NextResponse.json({ message: "Plotting berhasil dibatalkan" });
  } catch (error: any) {
    console.error("Error cancelling plotting:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
