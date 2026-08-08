import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkDocument } from "@/models/RplSkDocument";
import { getDefaultTitle, getDefaultKonsideran, getDefaultDasarHukum, getDefaultDiktum, generateSkNumberAwal, SkType } from "@/lib/rpl-sk";
import { Period } from "@/models/Period";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const body = await req.json();
    const { periodId, skType, skNumber, manualNumberOverride } = body;

    if (!periodId || !skType) {
      return NextResponse.json({ message: "periodId dan skType diperlukan" }, { status: 400 });
    }

    await connectMongoDB();

    // Check if already exists for this period to prevent reckless duplication
    const existing = await RplSkDocument.findOne({ periodId, skType, status: { $in: ["DRAFT", "FINAL"] } });
    if (existing) {
      return NextResponse.json({ message: "Draft atau SK Final sudah ada untuk tipe ini di periode berjalan. Silakan edit atau buat revisi dari detail SK.", data: existing }, { status: 400 });
    }

    const period = (await Period.findById(periodId)) as any;
    const year = period?.tahunAkademik ? period.tahunAkademik.split("/")[0] : new Date().getFullYear();

    const title = getDefaultTitle(skType as SkType, year);
    const konsideranMenimbang = getDefaultKonsideran(skType as SkType);
    const dasarHukum = getDefaultDasarHukum(skType as SkType);
    const diktumMenetapkan = getDefaultDiktum(skType as SkType);

    const newDraft = await RplSkDocument.create({
      periodId,
      skType,
      skNumber: skNumber || generateSkNumberAwal(),
      manualNumberOverride: manualNumberOverride || false,
      title,
      konsideranMenimbang,
      dasarHukum,
      diktumMenetapkan,
      status: "DRAFT",
      createdBy: session.id
    });

    return NextResponse.json({ message: "Draft SK berhasil dibuat", data: newDraft });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
