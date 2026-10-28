import { ensureRegistrationPayment } from "@/lib/payment-guard";
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
  await ensureRegistrationPayment(session.id);

  await connectMongoDB();
  const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();

  const initialData = profile ? JSON.parse(JSON.stringify(profile)) : {};

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40 }}>

      {/* ── Hero ── */}
      <PageHero
        title="Curriculum Vitae (CV) & Rekam Jejak"
        subtitle="Lengkapi data pekerjaan, riwayat pendidikan, pengalaman kerja, sertifikasi pelatihan, dan organisasi sebagai bukti awal pengakuan SKS RPL."
        tone="warning"
      />

      <CVForm initialData={initialData} />
    </div>
  );
}
