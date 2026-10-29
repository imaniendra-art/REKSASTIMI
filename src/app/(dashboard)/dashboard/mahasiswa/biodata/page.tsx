import { ensureRegistrationPayment } from "@/lib/payment-guard";
import { getSession } from "@/lib/session";
import { getOrCreateApplicantProfile } from "@/lib/applicant-profile";
import { redirect } from "next/navigation";
import BiodataForm from "./BiodataForm";
import { PageHero } from "@/components/dashboard/UIComponents";

export const metadata = {
  title: "Biodata Diri Mahasiswa - REKSA STIMI",
};

export default async function BiodataPage() {
  const session = await getSession();

  if (!session || session.role !== "mahasiswa") {
    redirect("/login");
  }
  await ensureRegistrationPayment(session.id);

  const { profile } = await getOrCreateApplicantProfile(session);

  const initialData = profile ? JSON.parse(JSON.stringify(profile)) : {};
  const concentration = (profile as any)?.concentration || "Manajemen";

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40 }}>
      {/* ── Hero ── */}
      <PageHero
        title="Formulir Biodata Diri"
        subtitle={`Lengkapi identitas sesuai KTP, KK, dan Ijazah SMA/Sederajat untuk kebutuhan validasi PDDIKTI Neo Feeder. Program: S1 Manajemen (${concentration}).`}
        tone="primary"
        style={{ marginBottom: 20 }}
      />

      <BiodataForm initialData={initialData} />
    </div>
  );
}
