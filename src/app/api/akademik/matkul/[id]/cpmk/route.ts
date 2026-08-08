import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";
import { MatkulCpmk } from "@/models/MatkulCpmk";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { id } = await params;

    const { nomorUrut, deskripsiCpmk } = body;
    if (!nomorUrut || !deskripsiCpmk) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const matkul = await MataKuliah.findById(id);
    if (!matkul) {
      return NextResponse.json({ error: "Matkul not found" }, { status: 404 });
    }

    const cpmk = await MatkulCpmk.create({
      matkulId: matkul._id,
      nomorUrut,
      deskripsiCpmk,
    });

    return NextResponse.json({ message: "CPMK created", data: cpmk }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
