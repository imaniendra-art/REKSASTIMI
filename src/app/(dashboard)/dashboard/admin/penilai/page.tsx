import { PageHero } from "@/components/dashboard/UIComponents";
import { MenuCard, StatCard } from "@/components/dashboard/SirestiCards";
import { roleMenu } from "@/lib/dashboard-data";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function ManajemenPenilaiHub() {
  await connectMongoDB();
  
  // Hitung jumlah penilai aktif
  const penilaiCount = await User.countDocuments({ role: "penilai", status: "aktif" });
  
  // Dapatkan menu khusus Manajemen Penilai
  const penilaiMenu = roleMenu.admin.find(m => m.label === "Manajemen Penilai")?.children || [];

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeText="Pusat Kendali"
        title="Manajemen Penilai"
        subtitle="Kelola database penilai, pemetaan keahlian, dan plotting tugas penilaian mahasiswa."
        tone="danger"
        withSparkles
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" style={{ marginBottom: 32 }}>
        <StatCard
          label="Database Penilai"
          value={`${penilaiCount}`}
          note="Penilai dengan status aktif di sistem"
          tone="danger"
          isTextValue={false}
        />
        <StatCard
          label="Plotting Aktif"
          value="Otomatis"
          note="Sistem membaca berdasarkan mapping F03"
          tone="warning"
          isTextValue={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" style={{ marginBottom: 32 }}>
        {penilaiMenu.map((item, idx) => (
          <MenuCard key={item.label} item={item} disabled={false} index={idx} />
        ))}
      </div>
      
      <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Informasi</h3>
        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, margin: 0 }}>
          Akun penilai baru dapat langsung ditambahkan di menu <strong>Data Penilai</strong>. Penilai yang ditambahkan akan secara otomatis dapat mengakses dashboard penilai mereka masing-masing. Pastikan penilai telah dilakukan mapping keahlian agar mereka muncul dalam daftar pilihan saat melakukan <strong>Plotting F03</strong>.
        </p>
      </div>
    </div>
  );
}
