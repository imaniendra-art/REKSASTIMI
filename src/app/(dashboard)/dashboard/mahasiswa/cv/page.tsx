import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { connectMongoDB } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import CVForm from "./CVForm";
import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";

export const metadata = {
  title: "CV & Riwayat Hidup Mahasiswa - REKSA STIMI",
};

export default async function MahasiswaCVPage() {
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();
  const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();

  const initialData = profile ? JSON.parse(JSON.stringify(profile)) : {};

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
        badgeIcon="📄"
        badgeText="Formulir F-07 Resmi"
        title="Curriculum Vitae (CV) & Rekam Jejak"
        subtitle="Lengkapi data pekerjaan, riwayat pendidikan, pengalaman kerja, sertifikasi pelatihan, dan organisasi sebagai bukti awal pengakuan SKS RPL."
        tone="warning"
      />

      <CVForm initialData={initialData} />
    </div>
  );
}
