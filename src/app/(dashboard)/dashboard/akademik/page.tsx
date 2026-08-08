import { MenuCard, StatCard } from "@/components/dashboard/SirestiCards";
import { PageHero } from "@/components/dashboard/UIComponents";
import { roleMenu } from "@/lib/dashboard-data";
import { connectMongoDB } from "@/lib/mongodb";
import { MataKuliah } from "@/models/MataKuliah";

export default async function AkademikDashboardPage() {
  await connectMongoDB();

  const countMaster = await MataKuliah.countDocuments();
  const countRpl = await MataKuliah.countDocuments({ isRpl: true });

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* ── Hero Banner ── */}
      <PageHero
        badgeIcon="🎓"
        badgeText="Portal Akademik"
        title="Data Akademik RPL"
        subtitle="Manajemen Kurikulum & Klaster Ilmu — STIMI YAPMI"
        rightContent={
          <span style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, border: "1px solid rgba(255,255,255,0.25)" }}>
            Role: Akademik
          </span>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" style={{ marginBottom: 32 }}>
        <StatCard label="Master Matkul" value={String(countMaster)} note="Total Kurikulum"       tone="primary"   index={0} />
        <StatCard label="Aktif RPL"    value={String(countRpl)}    note="Dibuka Jalur RPL"      tone="success"   index={1} />
        <StatCard label="Klaster Ilmu" value="—"                   note="Segera tersedia"       tone="info"      index={2} />
        <StatCard label="Status"       value="Online"              note="Sistem Terintegrasi"   tone="dark"      index={3} />
      </div>

      {/* ── Menu Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" style={{ marginBottom: 32 }}>
        {roleMenu.akademik.slice(1).map((item, i) => (
          <MenuCard item={item} key={item.label} disabled={false} index={i} />
        ))}
      </div>
    </div>
  );
}

