import { redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { User } from "@/models/User";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Klaster } from "@/models/Klaster";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { F03Evaluasi } from "@/models/F03Evaluasi";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { MatkulCpmk } from "@/models/MatkulCpmk";
import F03CetakClient from "./F03CetakClient";

export async function generateMetadata() {
  const session = await getSession();
  const nama = session?.name || "Mahasiswa";
  return {
    title: `F03 - ${nama}`,
  };
}

export default async function F03CetakPage({ params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await connectMongoDB();

  const userId = session.id;
  const { klasterId } = await params;

  // 1. Fetch User Data
  const user = await User.findById(userId).lean();
  const profile = await ApplicantProfile.findOne({ userId }).lean();
  const klaster = await Klaster.findById(klasterId).lean();
  const attempt = await AssessmentAttempt.findOne({ userId, klasterId }).lean();
  const existingF03 = await F03Evaluasi.find({ userId, klasterId }).lean();

  // 2. Fetch MataKuliah from F02 for this klaster
  const f02Claims = await F02Pengajuan.find({ userId }).lean();
  const claimedMatkulIds = f02Claims.map((claim: any) => claim.matkulId.toString());

  const klasterMatkuls = await KlasterMatkul.find({ klasterId }).lean();
  const validMatkulIds = klasterMatkuls
    .filter((km: any) => claimedMatkulIds.includes(km.matkulId.toString()))
    .map((km: any) => km.matkulId);

  const matkulsRaw = await MataKuliah.find({ _id: { $in: validMatkulIds } }).lean();

  // 3. Fetch CPMK for each Matkul
  const cpmks = await MatkulCpmk.find({ matkulId: { $in: validMatkulIds } }).lean();

  const matkuls = matkulsRaw.map((m: any) => ({
    ...m,
    cpmkList: cpmks
      .filter((c: any) => c.matkulId.toString() === m._id.toString())
      .sort((a: any, b: any) => a.nomorUrut - b.nomorUrut)
      .map((c: any) => c.deskripsi)
  }));

  if (!klaster || !user) {
    return <div className="p-8 text-center">Data tidak ditemukan.</div>;
  }

  const student = {
    namaLengkap: user.name,
    nim: profile?.nim || profile?.registrationNumber || user.username,
    tempatLahir: profile?.identity?.placeOfBirth,
    tanggalLahir: profile?.identity?.dateOfBirth,
    alamat: profile?.contact?.address || profile?.alamat,
    nomorHp: profile?.contact?.phone || profile?.whatsapp,
    email: user.email,
  };

  // Convert ObjectIds to strings to pass to client component safely
  const data = JSON.parse(JSON.stringify({
    student,
    klaster,
    attempt,
    matkuls,
    existingF03
  }));

  return (
    <F03CetakClient data={data} />
  );
}
