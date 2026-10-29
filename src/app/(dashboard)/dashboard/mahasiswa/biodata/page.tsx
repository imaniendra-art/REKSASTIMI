import { ensureRegistrationPayment } from "@/lib/payment-guard";
import { getSession } from "@/lib/session";
import { getOrCreateApplicantProfile } from "@/lib/applicant-profile";
import { redirect } from "next/navigation";
import BiodataForm from "./BiodataForm";

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

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40 }}>
      <BiodataForm initialData={initialData} />
    </div>
  );
}
