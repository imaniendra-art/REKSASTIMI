import { connectMongoDB } from "@/lib/mongodb";
import { PageHero } from "@/components/dashboard/UIComponents";
import { MenuCard, StatCard } from "@/components/dashboard/SirestiCards";
import { roleMenu } from "@/lib/dashboard-data";
import { ApplicantProfile } from "@/models/ApplicantProfile";

export default async function AdminMahasiswaPage() {
  await connectMongoDB();

  const [totalPendaftar, berkasMasuk, telahDinilai, lulus] = await Promise.all([
    ApplicantProfile.countDocuments(),
    ApplicantProfile.countDocuments({ statusRpl: { $nin: ["PENDAFTARAN", "LENGKAPI_CV", "PEMBAYARAN"] } }),
    ApplicantProfile.countDocuments({ statusRpl: { $in: ["KONFIRMASI_HASIL", "SIAP_PLENO", "LULUS"] } }),
    ApplicantProfile.countDocuments({ statusRpl: "LULUS" }),
  ]);

  const stats = [
    { label: "Total Pendaftar", value: String(totalPendaftar), note: "Seluruh periode", tone: "primary" },
    { label: "Berkas Masuk", value: String(berkasMasuk), note: "Dokumen diterima", tone: "info" },
    { label: "Telah Dinilai", value: String(telahDinilai), note: "Selesai asesmen", tone: "success" },
    { label: "Lulus RPL", value: String(lulus), note: "SK sudah diterbitkan", tone: "secondary" },
  ] as const;

  const subMenus = roleMenu.admin.find((item) => item.href === "/dashboard/admin/mahasiswa")?.children ?? [];

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeText="Manajemen Mahasiswa"
        title="Manajemen Mahasiswa RPL"
        subtitle="Ringkasan pendaftar, pengelolaan akun, berkas, dan monitoring asesmen."
        tone="primary"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} note={s.note} tone={s.tone} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" style={{ marginBottom: 32 }}>
        {subMenus.map((item, index) => (
          <MenuCard key={item.href} item={item} disabled={false} index={index} />
        ))}
      </div>
    </div>
  );
}
