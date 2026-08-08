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

// GET  — Fetch all mata kuliah, ordered by semester ASC, namaMatkul ASC
export async function GET() {
  const { response } = await requireAkademikAccess();
  if (response) return response;

  try {
    await connectMongoDB();
    const matkul = await MataKuliah.find().sort({ semester: 1, namaMatkul: 1 }).lean();

    const rplCount = await MataKuliah.countDocuments({ isRpl: true });

    const data = matkul.map((m) => ({
      id: m._id.toString(),
      kode: m.kode,
      namaMatkul: m.namaMatkul,
      sks: m.sks,
      semester: m.semester,
      kelompok: m.kelompok || "-",
      konsentrasi: m.konsentrasi || "",
      isRpl: m.isRpl,
      deskripsi: m.deskripsi || "",
    }));

    return NextResponse.json({ data, rplCount });
  } catch (error) {
    console.error("Error fetching matkul:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST — Create a new mata kuliah
export async function POST(request: NextRequest) {
  const { response } = await requireAkademikAccess();
  if (response) return response;

  try {
    const body = await request.json();
    const { kode, namaMatkul, sks, semester, kelompok, konsentrasi } = body;

    if (!kode || !namaMatkul) {
      return NextResponse.json({ message: "Kode dan Nama Matkul wajib diisi" }, { status: 400 });
    }

    await connectMongoDB();

    // Check duplicate kode
    const exists = await MataKuliah.findOne({ kode: kode.trim() });
    if (exists) {
      return NextResponse.json({ message: `Kode "${kode}" sudah digunakan.` }, { status: 409 });
    }

    const newMatkul = await MataKuliah.create({
      kode: kode.trim(),
      namaMatkul: namaMatkul.trim(),
      sks: Number(sks) || 3,
      semester: Number(semester) || 1,
      kelompok: kelompok?.trim() || "",
      konsentrasi: konsentrasi?.trim() || "",
      isRpl: true,
    });

    return NextResponse.json({
      message: "Mata kuliah berhasil ditambahkan",
      data: {
        id: newMatkul._id.toString(),
        kode: newMatkul.kode,
        namaMatkul: newMatkul.namaMatkul,
        sks: newMatkul.sks,
        semester: newMatkul.semester,
        kelompok: newMatkul.kelompok,
        konsentrasi: newMatkul.konsentrasi,
        isRpl: newMatkul.isRpl,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating matkul:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
