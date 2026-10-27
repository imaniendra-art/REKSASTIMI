import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/dashboard/UIComponents";
import FormF02Client from "./FormF02Client";
import Link from "next/link";

export const metadata = {
  title: "F02 Formulir Aplikasi RPL - REKSA STIMI",
};

export default async function F02Page() {
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();

  // 1. Fetch Profile for biodata card
  const profileDoc = await ApplicantProfile.findOne({ userId: session.id }).lean();
  const rawDob = profileDoc?.identity?.dateOfBirth;
  const dobString = rawDob instanceof Date ? rawDob.toISOString().split('T')[0] : String(rawDob || "-");

  const profile = profileDoc
    ? {
        name: profileDoc.identity?.fullName || session.name,
        nik: profileDoc.identity?.nik || "-",
        pob: profileDoc.identity?.placeOfBirth || "-",
        dob: dobString,
        gender: profileDoc.identity?.gender || "-",
      }
    : {
        name: session.name,
        nik: "-",
        pob: "-",
        dob: "-",
        gender: "-",
      };

  // 2. Fetch all Mata Kuliah
  const mkDocs = await MataKuliah.find().sort({ semester: 1, kode: 1 }).lean();
  const concentrationOptions = Array.from(
    new Set(
      mkDocs
        .map((mk) => String(mk.konsentrasi || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  
  // Group by semester
  const matkulPerSemester: Record<number, any[]> = {};
  mkDocs.forEach((mk) => {
    const sem = mk.semester || 0;
    if (!matkulPerSemester[sem]) {
      matkulPerSemester[sem] = [];
    }
    matkulPerSemester[sem].push({
      id: mk._id.toString(),
      kode: mk.kode,
      namaMatkul: mk.namaMatkul,
      sks: mk.sks,
      semester: mk.semester,
      isRpl: mk.isRpl !== false,
    });
  });

  // 3. Fetch existing F02 choices
  const existingF02 = await F02Pengajuan.find({ userId: session.id }).lean();
  const pilihanUser: Record<string, string> = {};
  existingF02.forEach((f) => {
    pilihanUser[f.matkulId.toString()] = f.jenisPengajuan;
  });

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40 }}>
      {/* ── Breadcrumb Back ── */}
      <div style={{ marginBottom: 14 }}>
        <Link
          href="/dashboard/mahasiswa"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 800,
            color: "var(--md-primary)",
            textDecoration: "none",
          }}
        >
          <span>←</span>
          <span>Kembali ke Beranda Mahasiswa</span>
        </Link>
      </div>

      <PageHero
        badgeIcon="📝"
        badgeText="Formulir Aplikasi RPL (F02)"
        title="Pemilihan Mata Kuliah Konversi"
        subtitle="Pilih mata kuliah yang ingin direkognisi berdasarkan rekam jejak kerja (Perolehan) atau pendidikan tinggi sebelumnya (Transfer)."
        tone="success"
      />

      <FormF02Client 
        profile={profile} 
        matkulPerSemester={matkulPerSemester} 
        pilihanUser={pilihanUser} 
        initialConcentration={profileDoc?.concentration || "-"}
        concentrationOptions={concentrationOptions}
      />
    </div>
  );
}
