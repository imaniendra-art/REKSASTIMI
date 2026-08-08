import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.namaKlaster !== undefined) updateData.namaKlaster = body.namaKlaster;
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Data update tidak valid" }, { status: 400 });
    }

    await connectMongoDB();
    const updated = await Klaster.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updated) {
      return NextResponse.json({ error: "Klaster tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { id } = await params;

    await connectMongoDB();
    const deleted = await Klaster.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ error: "Klaster tidak ditemukan" }, { status: 404 });
    }

    // Delete relationships
    await KlasterMatkul.deleteMany({ klasterId: id });

    return NextResponse.json({ success: true, message: "Klaster beserta relasinya berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
