import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { MataKuliah } from "@/models/MataKuliah";

async function requireAkademikAccess() {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return {
      session: null,
      response: NextResponse.json({ message: "Akses ditolak." }, { status: 403 })
    };
  }
  return { session, response: null };
}

// PATCH — Toggle isRpl or update fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAkademikAccess();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    await connectMongoDB();

    const matkul = await MataKuliah.findById(id);
    if (!matkul) {
      return NextResponse.json({ message: "Mata kuliah tidak ditemukan" }, { status: 404 });
    }

    // Toggle isRpl
    if (body.action === "toggle_rpl") {
      matkul.isRpl = !matkul.isRpl;
      await matkul.save();
      return NextResponse.json({ success: true, isRpl: matkul.isRpl });
    }

    // General update
    if (body.kode) matkul.kode = body.kode;
    if (body.namaMatkul) matkul.namaMatkul = body.namaMatkul;
    if (body.sks !== undefined) matkul.sks = body.sks;
    if (body.semester !== undefined) matkul.semester = body.semester;
    if (body.kelompok !== undefined) matkul.kelompok = body.kelompok;
    if (body.konsentrasi !== undefined) matkul.konsentrasi = body.konsentrasi;
    if (body.deskripsi !== undefined) matkul.deskripsi = body.deskripsi;

    await matkul.save();
    return NextResponse.json({ success: true, message: "Mata kuliah berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating matkul:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE — Remove a mata kuliah
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAkademikAccess();
  if (response) return response;

  try {
    const { id } = await params;
    await connectMongoDB();

    const deleted = await MataKuliah.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Mata kuliah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Mata kuliah berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting matkul:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
