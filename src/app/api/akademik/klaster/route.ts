import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  await connectMongoDB();
  
  const klasters = await Klaster.find().sort({ namaKlaster: 1 }).lean();
  const klasterMatkuls = await KlasterMatkul.find().lean();
  const matkuls = await MataKuliah.find().lean();

  const matkulMap = new Map();
  matkuls.forEach(m => matkulMap.set(m._id.toString(), m));

  const data = klasters.map(k => {
    const kMatkuls = klasterMatkuls.filter(km => km.klasterId.toString() === k._id.toString());
    const totalSks = kMatkuls.reduce((sum, km) => {
      const matkul = matkulMap.get(km.matkulId.toString());
      return sum + (matkul ? matkul.sks : 0);
    }, 0);

    return {
      id: k._id.toString(),
      nama: k.namaKlaster,
      jmlMatkul: kMatkuls.length,
      totalSks
    };
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["admin", "akademik"].includes(session.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { namaKlaster } = await req.json();
    if (!namaKlaster) {
      return NextResponse.json({ error: "Nama klaster diperlukan" }, { status: 400 });
    }

    await connectMongoDB();
    const klaster = await Klaster.create({ namaKlaster });
    return NextResponse.json(klaster, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
