import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkDocument } from "@/models/RplSkDocument";
import { RplSkLampiran } from "@/models/RplSkLampiran";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    await connectMongoDB();

    const sk = await RplSkDocument.findById(id).lean();
    if (!sk) return NextResponse.json({ message: "SK tidak ditemukan" }, { status: 404 });

    const lampiran = await RplSkLampiran.find({ skDocumentId: id }).sort({ order: 1 }).lean();

    return NextResponse.json({ data: { sk, lampiran } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    await connectMongoDB();
    
    const sk = await RplSkDocument.findById(id);
    if (!sk) return NextResponse.json({ message: "SK tidak ditemukan" }, { status: 404 });

    if (sk.status === "FINAL") {
      return NextResponse.json({ message: "SK FINAL tidak boleh diedit langsung. Buat revisi terlebih dahulu." }, { status: 400 });
    }

    body.updatedBy = session.id;

    // Remove protected fields
    delete body.status;
    delete body.version;

    const updated = await RplSkDocument.findByIdAndUpdate(id, { $set: body }, { new: true });

    return NextResponse.json({ message: "Draft SK berhasil diupdate", data: updated });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
