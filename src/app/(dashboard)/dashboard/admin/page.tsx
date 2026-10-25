import { MenuCard, StatCard } from "@/components/dashboard/SirestiCards";
import { PageHero } from "@/components/dashboard/UIComponents";
import { roleMenu } from "@/lib/dashboard-data";
import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  await connectMongoDB();
  const session = await getSession();
  const userName = session?.name || "Admin";
  const userRole = session?.role || "admin";

  const [
    totalPendaftar,
    penilaiAktif,
    prosesAsesmen,
    siapPlotting,
    butuhKonfirmasi,
    siapPleno,
    lulus,
    activePeriod
  ] = await Promise.all([
    ApplicantProfile.countDocuments(),
    User.countDocuments({ role: "penilai", status: "aktif" }),
    ApplicantProfile.countDocuments({ statusRpl: { $in: ["ASESMEN_F02", "ASESMEN_KOMPETENSI", "EVALUASI_F03", "EVALUASI_ASESOR"] } }),
    ApplicantProfile.countDocuments({ statusRpl: "ASESMEN_KOMPETENSI" }),
    ApplicantProfile.countDocuments({ statusRpl: "KONFIRMASI_HASIL" }),
    ApplicantProfile.countDocuments({ statusRpl: "SIAP_PLENO" }),
    ApplicantProfile.countDocuments({ statusRpl: "LULUS" }),
    Period.findOne({ isActive: true }).lean()
  ]);

  const latestPeriod = activePeriod ? activePeriod.namaPeriode : "Tidak Ada";

  const utama = roleMenu.admin.slice(1, 5);
  const administrasi = roleMenu.admin.slice(5);

  const stats = [
    { label: "Total Pendaftar",   value: String(totalPendaftar),  note: "Seluruh mahasiswa RPL",      tone: "primary"   },
    { label: "Penilai Aktif",     value: String(penilaiAktif),   note: "Penilai yang bertugas",        tone: "secondary" },
    { label: "Proses Asesmen",    value: String(prosesAsesmen),   note: "Sedang dalam proses",         tone: "warning"   },
    { label: "Siap Plotting",     value: String(siapPlotting),    note: "Selesai asesmen kompetensi",  tone: "dark"      },
    { label: "Butuh Konfirmasi",  value: String(butuhKonfirmasi),    note: "Hasil asesmen perlu disetujui", tone: "info"    },
    { label: "Siap Pleno",        value: String(siapPleno),    note: "Siap difinalisasi admin",     tone: "secondary" },
    { label: "Lulus RPL",         value: String(lulus),   note: "SK sudah diterbitkan",        tone: "success"   },
    { label: "Batch Aktif",       value: latestPeriod, note: "Periode aktif",             tone: "dark", isTextValue: true },
  ] as const;

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <PageHero
        title={<>Selamat Datang, <span style={{ color: "#e0e7ff" }}>{userName}</span></>}
        subtitle={<>Selamat bekerja sebagai <strong style={{ textTransform: "capitalize", color: "#fff" }}>{userRole}</strong>! Semoga harimu menyenangkan.<br/><span style={{ fontSize: 13, opacity: 0.8 }}>Rekognisi Evaluasi dan Konversi Akademik STIMI (REKSA) — STIMI YAPMI Makassar</span></>}
        withSparkles
      />

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 w-full" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            note={s.note}
            tone={s.tone}
            index={i}
            isTextValue={"isTextValue" in s ? s.isTextValue : false}
          />
        ))}
      </div>

      {/* ── Menu Keseluruhan ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
        {[...utama, ...administrasi].map((item, i) => (
          <MenuCard item={item} key={item.label} disabled={false} index={i} />
        ))}
      </div>
    </div>
  );
}
