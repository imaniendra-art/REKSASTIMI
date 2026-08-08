import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { connectMongoDB } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import CVForm from "./CVForm";
import { PageHero } from "@/components/dashboard/UIComponents";

export const metadata = {
  title: "CV & Riwayat Hidup - REKSA STIMI",
};

export default async function MahasiswaCVPage() {
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }

  await connectMongoDB();
  const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();

  // Convert to plain object for Client Component
  const initialData = profile ? JSON.parse(JSON.stringify(profile)) : {};

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* ── Hero ── */}
      <PageHero
        badgeIcon="📄"
        badgeText="Curriculum Vitae"
        title="Riwayat Hidup & Pengalaman"
        subtitle="Lengkapi rekam jejak pendidikan dan pengalaman profesional Anda sebagai dasar asesmen RPL."
        tone="warning"
      />

      <CVForm initialData={initialData} />
    </div>
  );
}
