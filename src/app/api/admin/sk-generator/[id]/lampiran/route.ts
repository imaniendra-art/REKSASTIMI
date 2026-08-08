import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkLampiran } from "@/models/RplSkLampiran";
import { RplSkDocument } from "@/models/RplSkDocument";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    await connectMongoDB();

    const sk = await RplSkDocument.findById(id);
    if (!sk) return NextResponse.json({ message: "SK tidak ditemukan" }, { status: 404 });

    if (sk.status === "FINAL") {
      return NextResponse.json({ message: "Tidak dapat mengubah lampiran pada SK yang sudah FINAL." }, { status: 400 });
    }

    const newLampiran = await RplSkLampiran.create({
      skDocumentId: id,
      periodId: sk.periodId,
      lampiranType: body.lampiranType || "LAINNYA",
      title: body.title,
      fileUrl: body.fileUrl,
      originalFileName: body.originalFileName,
      order: body.order || 1,
      createdBy: session.id
    });

    return NextResponse.json({ message: "Lampiran berhasil ditambahkan", data: newLampiran });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;
    const lampiranId = req.nextUrl.searchParams.get("lampiranId");

    if (!lampiranId) return NextResponse.json({ message: "lampiranId diperlukan" }, { status: 400 });

    await connectMongoDB();

    const sk = await RplSkDocument.findById(id);
    if (sk && sk.status === "FINAL") {
      return NextResponse.json({ message: "Tidak dapat mengubah lampiran pada SK yang sudah FINAL." }, { status: 400 });
    }

    await RplSkLampiran.findByIdAndDelete(lampiranId);

    return NextResponse.json({ message: "Lampiran berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
