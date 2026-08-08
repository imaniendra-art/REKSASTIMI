import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { RplDocument } from "@/models/RplDocument";

import { generateVerifiedToken } from "@/lib/document-token";

export async function POST(req: Request, { params }: { params: Promise<{ mahasiswaId: string }> }) {
  try {
    const { mahasiswaId } = await params;
    const body = await req.json();
    const { documentType, reason } = body;
    
    if (!documentType) return NextResponse.json({ message: "Invalid type" }, { status: 400 });

    await connectMongoDB();

    let latestDoc = await RplDocument.findOne({ mahasiswaId, documentType }).sort({ version: -1 });

    if (!latestDoc) {
      return NextResponse.json({ message: "Tidak ada versi sebelumnya untuk direvisi." }, { status: 404 });
    }

    // Mark old as not latest
    latestDoc.isLatestVersion = false;
    await latestDoc.save();

    // Create new revision
    const newToken = generateVerifiedToken();
    const newDoc = new RplDocument({
      mahasiswaId,
      documentType,
      status: "REVISI",
      verifiedToken: newToken,
      version: latestDoc.version + 1,
      isLatestVersion: true,
      previousDocumentId: latestDoc._id,
      revisedFromVersion: latestDoc.version,
      revisionReason: reason || "Revisi Manual",
      revisedAt: new Date()
    });
    await newDoc.save();

    return NextResponse.json({ success: true, newVersion: newDoc.version });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
