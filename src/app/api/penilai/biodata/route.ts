import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PenilaiProfile } from "@/models/PenilaiProfile";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "penilai") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const user = await User.findById(session.id).lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const profile = await PenilaiProfile.findOne({ userId: session.id }).lean();

    return NextResponse.json({
      user,
      profile,
    });
  } catch (error) {
    console.error("Error fetching penilai biodata:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "penilai") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const body = await request.json();

    const updateFields: any = {
      namaLengkap: body.namaLengkap,
      email: body.email,
      noHp: body.noHp,
      nidn: body.nidn,
      jenisPenilai: body.jenisPenilai,
      instansi: body.instansi,
      bidangKeahlian: body.bidangKeahlian,
      jenisKelamin: body.jenisKelamin,
      tempatLahir: body.tempatLahir,
      tanggalLahir: body.tanggalLahir,
      nik: body.nik,
      pendidikanTerakhir: body.pendidikanTerakhir,
      prodiKeilmuan: body.prodiKeilmuan,
      alamatRumah: body.alamatRumah,
      scanTtdUrl: body.scanTtdUrl,
      riwayatPendidikan: body.riwayatPendidikan,
      namaPT: body.namaPT,
      alamatPT: body.alamatPT,
      pengalamanMengajar: body.pengalamanMengajar,
      pekerjaan: body.pekerjaan,
      instansiKerja: body.instansiKerja,
      telpKantor: body.telpKantor,
      pengalamanIndustri: body.pengalamanIndustri,
      sertifikasiProfesi: body.sertifikasiProfesi,
      bidangKeahlianKerja: body.bidangKeahlianKerja,
      namaAsosiasi: body.namaAsosiasi,
      noAnggotaAsosiasi: body.noAnggotaAsosiasi,
      jabatanAsosiasi: body.jabatanAsosiasi,
      alamatAsosiasi: body.alamatAsosiasi,
      telpFaxAsosiasi: body.telpFaxAsosiasi
    };

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    await User.findByIdAndUpdate(session.id, { $set: { name: body.namaLengkap, email: body.email } });

    await PenilaiProfile.findOneAndUpdate(
      { userId: session.id },
      { $set: updateFields },
      { upsert: true }
    );

    return NextResponse.json({ message: "Biodata berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating penilai biodata:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
