import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "penilai")) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });
    }

    // Hanya izinkan PNG
    if (file.type !== "image/png") {
      return NextResponse.json({ message: "File harus berupa format PNG" }, { status: 400 });
    }

    // Cek ukuran max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = ".png";
    const filename = `ttd_${session.id}_${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "ttd");

    // Pastikan folder ada
    await fs.mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    const fileUrl = `/uploads/ttd/${filename}`;

    return NextResponse.json({ 
      message: "File berhasil diunggah", 
      url: fileUrl 
    });

  } catch (error: any) {
    console.error("Error uploading ttd:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
