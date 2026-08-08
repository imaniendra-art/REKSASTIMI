import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PenilaiProfile } from "@/models/PenilaiProfile";
import { PenilaiKlaster } from "@/models/PenilaiKlaster";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const user = await User.findOne({ _id: id, role: "penilai" }).lean();
    if (!user) return NextResponse.json({ message: "Penilai tidak ditemukan" }, { status: 404 });

    const profile = await PenilaiProfile.findOne({ userId: id }).lean();
    const mappings = await PenilaiKlaster.find({ penilaiId: id, isActive: true }).lean();

    return NextResponse.json({
      user,
      profile,
      klasterIds: mappings.map((m: any) => m.klasterId.toString())
    });
  } catch (error) {
    console.error("Error fetching penilai detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const { id } = await params;
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

    // Remove undefined values
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const user = await User.findOneAndUpdate(
      { _id: id, role: "penilai" },
      { $set: { name: body.namaLengkap, email: body.email } },
      { new: true }
    );

    if (!user) return NextResponse.json({ message: "Penilai tidak ditemukan" }, { status: 404 });

    await PenilaiProfile.findOneAndUpdate(
      { userId: id },
      { $set: updateFields },
      { upsert: true }
    );

    return NextResponse.json({ message: "Profil penilai berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating penilai:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
