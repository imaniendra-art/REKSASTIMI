import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";

const steps = [
  { title: "1. Biodata", desc: "Lengkapi data diri, alamat, kontak, dan identitas sesuai dokumen resmi.", tone: "var(--md-primary)", bg: "var(--md-primary-container)" },
  { title: "2. CV Riwayat", desc: "Isi riwayat pendidikan, pekerjaan, pelatihan, penghargaan, dan organisasi.", tone: "#059669", bg: "#d1fae5" },
  { title: "3. Pembayaran", desc: "Konfirmasi pembayaran dan tunggu validasi dari bagian keuangan.", tone: "#d97706", bg: "#fef3c7" },
  { title: "4. Form F02", desc: "Pilih mata kuliah RPL dan tentukan jenis pengajuan Transfer atau Perolehan.", tone: "var(--md-secondary, var(--md-primary))", bg: "var(--md-secondary-container, var(--md-primary-container))" },
  { title: "5. Asesmen", desc: "Ikuti asesmen kompetensi sesuai jadwal dan instruksi yang tersedia.", tone: "#dc2626", bg: "#fee2e2" },
  { title: "6. Form F03", desc: "Lengkapi evaluasi diri dan bukti portofolio untuk mata kuliah yang diajukan.", tone: "var(--md-primary)", bg: "var(--md-primary-container)" },
  { title: "7. Verifikasi Penilai", desc: "Tunggu proses pemeriksaan dan penilaian oleh tim penilai.", tone: "#334155", bg: "#f1f5f9" },
  { title: "8. Selesai", desc: "Jika disetujui, hasil RPL diproses untuk pengakuan SKS.", tone: "#16a34a", bg: "#dcfce7" },
];

const guides = [
  { title: "Pedoman RPL STIMI YAPMI", desc: "Panduan umum kebijakan dan tahapan RPL di lingkungan STIMI YAPMI Makassar.", href: "/dashboard/mahasiswa/download", tone: "var(--md-primary)" },
  { title: "Pusat Download Dokumen", desc: "Akses formulir, bukti pembayaran, dan status dokumen RPL Anda.", href: "/dashboard/mahasiswa/download", tone: "#d97706" },
];

export default function MahasiswaPetunjukPage() {
  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 36 }}>
      <PageHero
        title="Petunjuk Penggunaan REKSA"
        subtitle="Ikuti urutan berikut untuk menyelesaikan proses pendaftaran dan asesmen RPL."
        tone="primary"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
        {steps.map((step) => (
          <div key={step.title} className="md-card" style={{ padding: 18, borderLeft: `5px solid ${step.tone}`, background: "var(--md-surface-1)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: step.bg, color: step.tone, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, marginBottom: 12 }}>
              {step.title.split(".")[0]}
            </div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 950, color: "var(--md-on-surface)" }}>{step.title}</h2>
            <p style={{ margin: "7px 0 0", fontSize: 12, lineHeight: 1.55, fontWeight: 650, color: "var(--md-on-surface-variant)" }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <section className="md-card" style={{ padding: 20, marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--md-primary)" }}>
          Dokumen Pedoman RPL
        </p>
        <h2 style={{ margin: "5px 0 14px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)" }}>
          Akses Cepat Panduan dan Berkas
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {guides.map((guide) => (
            <Link key={guide.title} href={guide.href} className="md-card" style={{ padding: 18, textDecoration: "none", borderLeft: `5px solid ${guide.tone}` }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 950, color: "var(--md-on-surface)" }}>{guide.title}</h3>
              <p style={{ margin: "7px 0 14px", fontSize: 12, lineHeight: 1.55, color: "var(--md-on-surface-variant)", fontWeight: 650 }}>{guide.desc}</p>
              <span style={{ display: "inline-flex", borderRadius: 999, padding: "8px 14px", background: guide.tone, color: "#fff", fontSize: 11, fontWeight: 900 }}>
                Buka
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/dashboard/mahasiswa" style={{ display: "inline-flex", borderRadius: 999, padding: "10px 18px", background: "var(--md-primary)", color: "#fff", fontSize: 12, fontWeight: 900, textDecoration: "none" }}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
