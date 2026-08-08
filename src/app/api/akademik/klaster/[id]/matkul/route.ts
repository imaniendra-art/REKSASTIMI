import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { getSession } from "@/lib/session";
import mongoose from "mongoose";

// Add matkul to klaster
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { matkulId } = await req.json();

    if (!matkulId) {
      return NextResponse.json({ error: "Matkul ID diperlukan" }, { status: 400 });
    }

    await connectMongoDB();

    // Remove matkul from any other klaster first (1 matkul = 1 klaster rule from SIRESTI)
    await KlasterMatkul.deleteMany({ matkulId });

    // Add to new klaster
    const rel = await KlasterMatkul.create({
      klasterId: new mongoose.Types.ObjectId(id),
      matkulId: new mongoose.Types.ObjectId(matkulId)
    });

    return NextResponse.json(rel, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Mata kuliah sudah ada di klaster ini" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove matkul from klaster
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const matkulId = url.searchParams.get("matkulId");

    if (!matkulId) {
      return NextResponse.json({ error: "Matkul ID diperlukan" }, { status: 400 });
    }

    await connectMongoDB();
    
    await KlasterMatkul.findOneAndDelete({
      klasterId: id,
      matkulId: matkulId
    });

    return NextResponse.json({ success: true, message: "Matkul dilepas dari klaster" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
