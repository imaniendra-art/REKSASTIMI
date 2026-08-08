import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import { formatRupiah, getFinancePayments } from "./data";
import { PaymentValidationTable } from "./PaymentValidationTable";

export default async function KeuanganDashboardPage() {
  const payments = await getFinancePayments();
  const pending = payments.filter((item) => item.statusVerifikasi === "Proses");
  const accepted = payments.filter((item) => item.statusVerifikasi === "Diterima");
  const rejected = payments.filter((item) => item.statusVerifikasi === "Ditolak");
  const totalDana = accepted.reduce((sum, item) => sum + item.nominal, 0);
  const latestPending = pending.slice(0, 5);

  const stats = [
    { label: "Total Dana Masuk", value: formatRupiah(totalDana), note: "Pembayaran diterima", color: "var(--md-primary)", bg: "var(--md-primary-container)" },
    { label: "Antrean Validasi", value: String(pending.length), note: "Menunggu pemeriksaan", color: "var(--md-warning)", bg: "var(--md-warning-container)" },
    { label: "Pembayaran Valid", value: String(accepted.length), note: "Sudah diverifikasi", color: "var(--md-success)", bg: "var(--md-success-container)" },
    { label: "Pembayaran Ditolak", value: String(rejected.length), note: "Perlu perbaikan", color: "var(--md-error)", bg: "var(--md-error-container)" },
  ];

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <PageHero
        badgeIcon="Rp"
        badgeText="Panel Keuangan"
        title="Panel Kendali Keuangan"
        subtitle="Verifikasi pembayaran mahasiswa dan pantau rekap dana RPL."
        rightContent={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/dashboard/keuangan/validasi" style={heroButtonPrimary}>
              Antrean Validasi
            </Link>
            <Link href="/dashboard/keuangan/rekap" style={heroButtonSecondary}>
              Rekap Dana
            </Link>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 22 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="md-card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
              <p style={{ color: "var(--md-on-surface)", fontSize: 22, fontWeight: 900, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis" }}>{stat.value}</p>
              <p style={{ color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 700, marginTop: 3 }}>{stat.note}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>Rp</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 22, borderRadius: 99, background: "var(--md-warning)" }} />
        <div>
          <h2 style={{ color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>Antrean Validasi Pembayaran</h2>
          <p style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 700, marginTop: 2 }}>Bukti transfer terbaru yang perlu dicek oleh bagian keuangan.</p>
        </div>
        <span style={{ marginLeft: "auto", background: "var(--md-warning-container)", color: "var(--md-warning)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 900 }}>
          {pending.length} Pending
        </span>
      </div>

      <PaymentValidationTable
        rows={latestPending}
        showActions
        emptyTitle="Tidak ada antrean validasi"
        emptyMessage="Saat ini belum ada bukti pembayaran mahasiswa yang menunggu pemeriksaan."
      />
    </div>
  );
}

const heroButtonPrimary = {
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  background: "#fff",
  color: "var(--md-primary)",
  padding: "9px 16px",
  fontSize: 12,
  fontWeight: 900,
} satisfies CSSProperties;

const heroButtonSecondary = {
  ...heroButtonPrimary,
  background: "rgba(255,255,255,0.16)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.3)",
} satisfies CSSProperties;
