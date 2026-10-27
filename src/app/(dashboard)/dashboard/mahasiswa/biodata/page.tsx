import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { connectMongoDB } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import BiodataForm from "./BiodataForm";
import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";

export const metadata = {
  title: "Biodata Diri Mahasiswa - REKSA STIMI",
};

export default async function BiodataPage() {
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();
  const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();

  const initialData = profile ? JSON.parse(JSON.stringify(profile)) : {};
  const concentration = (profile as any)?.concentration || "Manajemen";

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

      {/* ── Hero ── */}
      <PageHero
        badgeIcon="👤"
        badgeText="Identitas Resmi Calon Mahasiswa"
        title="Formulir Biodata Diri"
        subtitle={`Lengkapi identitas sesuai KTP, KK, dan Ijazah SMA/Sederajat untuk kebutuhan validasi PDDIKTI Neo Feeder. Program: S1 Manajemen (${concentration}).`}
        tone="primary"
      />

      <BiodataForm initialData={initialData} />
    </div>
  );
}
