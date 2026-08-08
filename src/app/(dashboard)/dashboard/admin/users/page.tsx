import { MenuCard, SectionHeading, StatCard } from "@/components/dashboard/SirestiCards";
import { PageHero } from "@/components/dashboard/UIComponents";
import { roleMenu } from "@/lib/dashboard-data";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export default async function AccountCenterPage() {
  await connectMongoDB();

  const [adminTotal, keuanganTotal, akademikTotal, penilaiTotal, mahasiswaTotal, aktifTotal] =
    await Promise.all([
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "keuangan" }),
      User.countDocuments({ role: "akademik" }),
      User.countDocuments({ role: "penilai" }),
      User.countDocuments({ role: "mahasiswa" }),
      User.countDocuments({ status: "aktif" }),
    ]);

  const accountMenu = roleMenu.admin.find((item) => item.href === "/dashboard/admin/users");
  const submenu = accountMenu?.children ?? [];

  const stats = [
    { label: "Super Admin", value: String(adminTotal), note: "Akses pengelola utama", tone: "dark" },
    { label: "Keuangan", value: String(keuanganTotal), note: "Validasi pembayaran", tone: "success" },
    { label: "Akademik", value: String(akademikTotal), note: "Pengelolaan akademik", tone: "primary" },
    { label: "Penilai", value: String(penilaiTotal), note: "Akun penilai RPL", tone: "danger" },
    { label: "Mahasiswa", value: String(mahasiswaTotal), note: "Akun peserta RPL", tone: "info" },
    { label: "Akun Aktif", value: String(aktifTotal), note: "Seluruh role aktif", tone: "secondary" },
  ] as const;

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeText="Pusat Akun"
        title="Pusat Akun & Keamanan"
        subtitle="Kelola pemantauan akun REKSA STIMI berdasarkan kelompok pengelola dan mahasiswa RPL. Halaman ini mengikuti pola daftar akun SIRESTI dengan tampilan dashboard REKSA."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full" style={{ marginBottom: 28 }}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <SectionHeading
        title="Submenu Pusat Akun"
        subtitle="Pilih daftar akun yang ingin diperiksa."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {submenu.map((item, index) => (
          <MenuCard key={item.href} item={item} disabled={false} index={index} />
        ))}
      </div>
    </div>
  );
}
