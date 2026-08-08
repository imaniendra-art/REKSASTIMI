import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplPeriodTeam } from "@/models/RplPeriodTeam";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    await connectMongoDB();
    const updated = await RplPeriodTeam.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ message: "Data berhasil diupdate", data: updated });
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
    // Soft delete / hide or hard delete based on preference. Let's hard delete for simplicity here
    await RplPeriodTeam.findByIdAndDelete(id);

    return NextResponse.json({ message: "Anggota berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
