import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    let username = String(body.username ?? "").trim().toLowerCase();
    
    if (username && !username.startsWith("rpl-")) {
      username = `rpl-${username}`;
    }
    
    const password = String(body.password ?? "");

    if (!name || !username || !password) {
      return NextResponse.json(
        { message: "Nama Lengkap, Username, dan Password wajib diisi." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan, silakan pilih yang lain." },
        { status: 409 }
      );
    }

    const activePeriod = await Period.findOne({ isActive: true }).lean();
    if (!activePeriod) {
      return NextResponse.json(
        { message: "Pendaftaran RPL belum dibuka." },
        { status: 400 }
      );
    }

    // Hash password securely using bcrypt
    const passwordHash = await hashPassword(password);

    // Create User
    const user = await User.create({
      username,
      passwordHash,
      name,
      role: "mahasiswa",
      status: "aktif",
    });

    // Create initial ApplicantProfile
    await ApplicantProfile.create({
      userId: user._id,
      periodId: activePeriod._id,
      periodName: activePeriod.namaPeriode,
      statusRpl: "PENDAFTARAN",
      identity: {
        fullName: name,
      },
      progress: {
        paymentStatus: "BELUM_BAYAR",
        f02Status: "BELUM",
        f03Status: "BELUM",
        assessmentStatus: "BELUM",
        resultStatus: "BELUM",
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses registrasi." },
      { status: 500 }
    );
  }
}
