import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { connectMongoDB } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import BiodataForm from "./BiodataForm";
import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";

export const metadata = {
  title: "Biodata Diri - REKSA STIMI",
};

export default async function BiodataPage() {
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
        badgeIcon="👤"
        badgeText="Biodata Diri"
        title="Data Pribadi"
        subtitle="Lengkapi data sesuai KTP & Ijazah untuk pelaporan PDDIKTI (Neo Feeder)."
        tone="primary"
      />

      <BiodataForm initialData={initialData} />
    </div>
  );
}
