import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { hashPassword } from "@/lib/password";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const prodi = String(body.prodi ?? "S1 Manajemen").trim();
    const pendidikanTerakhir = String(body.pendidikanTerakhir ?? "SMA/SMK/MA").trim();

    let username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !password) {
      return NextResponse.json(
        { message: "Nama Lengkap dan Password wajib diisi." },
        { status: 400 }
      );
    }

    // Auto-generate username from email or name if omitted
    if (!username) {
      const base = email ? email.split("@")[0].replace(/[^a-z0-9]/g, "") : name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
      username = `rpl-${base || "mhs"}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (!username.startsWith("rpl-")) {
      username = `rpl-${username}`;
    }

    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan, silakan pilih username lain." },
        { status: 409 }
      );
    }

    const activePeriod = await Period.findOne({ isActive: true }).lean();
    if (!activePeriod) {
      return NextResponse.json(
        { message: "Pendaftaran RPL periode ini belum dibuka oleh administrator." },
        { status: 400 }
      );
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);

    // Create User
    const user = await User.create({
      username,
      passwordHash,
      name,
      email: email || `${username}@reksa.stimi.ac.id`,
      role: "mahasiswa",
      status: "aktif",
    });

    // Create ApplicantProfile with initial lightweight data
    await ApplicantProfile.create({
      userId: user._id,
      periodId: activePeriod._id,
      periodName: activePeriod.namaPeriode,
      program: prodi,
      statusRpl: "PENDAFTARAN",
      identity: {
        fullName: name,
      },
      contact: {
        email: email || `${username}@reksa.stimi.ac.id`,
        phone: whatsapp,
      },
      education: {
        lastLevel: pendidikanTerakhir,
      },
      progress: {
        paymentStatus: "BELUM_BAYAR",
        f02Status: "BELUM",
        f03Status: "BELUM",
        assessmentStatus: "BELUM",
        resultStatus: "BELUM",
      },
    });

    // Auto-login session so user can directly proceed to payment upload
    await setSession({
      id: user._id.toString(),
      username: user.username,
      role: "mahasiswa",
      name: user.name,
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Silakan unggah bukti transfer pendaftaran Anda.",
        redirectUrl: "/dashboard/mahasiswa/keuangan",
      },
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
