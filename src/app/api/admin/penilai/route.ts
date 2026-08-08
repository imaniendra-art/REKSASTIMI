import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PenilaiProfile } from "@/models/PenilaiProfile";
import { PenilaiKlaster } from "@/models/PenilaiKlaster";
import { hashPassword } from "@/lib/password";
import { Klaster } from "@/models/Klaster";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const penilais = await User.find({ role: "penilai" }).lean();
    
    // Fetch profiles and mappings
    const profiles = await PenilaiProfile.find({ userId: { $in: penilais.map(p => p._id) } }).lean();
    const mappings = await PenilaiKlaster.find({ penilaiId: { $in: penilais.map(p => p._id) }, isActive: true }).lean();
    
    // Fetch klaster names for mapping display
    const klasterIds = [...new Set(mappings.map((m: any) => m.klasterId.toString()))];
    const klasters = await Klaster.find({ _id: { $in: klasterIds } }).lean();
    const klasterMap = new Map(klasters.map((k: any) => [k._id.toString(), k.namaKlaster]));

    const data = penilais.map((user: any) => {
      const profile = profiles.find((p: any) => p.userId.toString() === user._id.toString());
      const userMappings = mappings
        .filter((m: any) => m.penilaiId.toString() === user._id.toString())
        .map((m: any) => ({
          klasterId: m.klasterId,
          namaKlaster: klasterMap.get(m.klasterId.toString()) || "Unknown"
        }));

      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        status: user.status,
        profile: profile || null,
        klasters: userMappings
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching penilai:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const body = await request.json();

    const {
      username,
      password,
      namaLengkap,
      email,
      noHp,
      nidn,
      jenisPenilai,
      instansi,
      bidangKeahlian
    } = body;

    if (!username || !password || !namaLengkap) {
      return NextResponse.json({ message: "Username, password, dan nama lengkap wajib diisi" }, { status: 400 });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: "Username sudah terdaftar" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      username,
      passwordHash,
      name: namaLengkap,
      email,
      role: "penilai",
      status: "aktif"
    });

    await PenilaiProfile.create({
      userId: newUser._id,
      nidn,
      namaLengkap,
      email,
      noHp,
      jenisPenilai,
      instansi,
      bidangKeahlian,
      isActive: true
    });

    return NextResponse.json({ message: "Penilai berhasil ditambahkan", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating penilai:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
