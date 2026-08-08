import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkDocument } from "@/models/RplSkDocument";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const { id } = await params;

    await connectMongoDB();

    const sk = await RplSkDocument.findById(id);
    if (!sk) return NextResponse.json({ message: "SK tidak ditemukan" }, { status: 404 });

    if (sk.status !== "FINAL") {
      return NextResponse.json({ message: "Hanya SK FINAL yang dapat direvisi. Jika masih draft silakan langsung diedit." }, { status: 400 });
    }

    // Create a new document representing the revision draft
    const newRevision = await RplSkDocument.create({
        periodId: sk.periodId,
        skType: sk.skType,
        skNumber: sk.skNumber,
        manualNumberOverride: sk.manualNumberOverride,
        title: sk.title,
        konsideranMenimbang: sk.konsideranMenimbang,
        dasarHukum: sk.dasarHukum,
        diktumMenetapkan: sk.diktumMenetapkan,
        signers: sk.signers,
        status: "REVISI",
        version: sk.version + 1,
        createdBy: session.id
    });

    return NextResponse.json({ message: "Draft Revisi SK berhasil dibuat", data: newRevision });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
