"use client";

import { useState, useMemo } from "react";
import { formatRupiah, type FinanceAnalytics, type FinancePaymentRow } from "./types";
import { PaymentValidationTable } from "./PaymentValidationTable";

type KeuanganDashboardClientProps = {
  payments: FinancePaymentRow[];
  analytics: FinanceAnalytics;
};

export function KeuanganDashboardClient({
  payments,
  analytics,
}: KeuanganDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"semua" | "Diterima" | "Proses" | "Ditolak">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.statusVerifikasi === "Proses"),
    [payments]
  );

  const filteredHistory = useMemo(() => {
    return payments.filter((item) => {
      const matchTab = activeTab === "semua" || item.statusVerifikasi === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        item.studentEmail.toLowerCase().includes(q) ||
        item.jenisPembayaran.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [payments, activeTab, searchQuery]);

  // Max value for bar chart scaling
  const maxMonthlyTotal = useMemo(() => {
    const max = Math.max(...analytics.monthlyTrends.map((t) => t.total), 1);
    return max;
  }, [analytics.monthlyTrends]);

  // Percentage calculations for breakdown
  const pctPendaftaran = analytics.totalDanaMasuk > 0
    ? Math.round((analytics.totalPendaftaranNominal / analytics.totalDanaMasuk) * 100)
    : 0;
  const pctAsesmen = analytics.totalDanaMasuk > 0
    ? Math.round((analytics.totalAsesmenNominal / analytics.totalDanaMasuk) * 100)
    : 0;
  const pctLainnya = analytics.totalDanaMasuk > 0
    ? Math.round((analytics.totalLainnyaNominal / analytics.totalDanaMasuk) * 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      
      {/* ── 1. KARTU STATISTIK FINANSIAL UTAMA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dana Masuk */}
        <div className="md-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Dana Masuk
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--md-primary)", fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {formatRupiah(analytics.totalDanaMasuk)}
            </p>
            <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
              {analytics.totalAcceptedCount} transaksi terverifikasi
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            💰
          </div>
        </div>

        {/* Antrean Validasi */}
        <div className="md-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Antrean Validasi
            </p>
            <p style={{ margin: "4px 0 0", color: analytics.totalPendingCount > 0 ? "var(--md-warning)" : "var(--md-on-surface)", fontSize: 22, fontWeight: 900 }}>
              {analytics.totalPendingCount} Berkas
            </p>
            <p style={{ margin: "3px 0 0", color: analytics.totalPendingCount > 0 ? "var(--md-warning)" : "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 700 }}>
              {analytics.totalPendingCount > 0 ? "⚠️ Butuh tindakan segera" : "Semua pembayaran tuntas"}
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--md-warning-container)", color: "var(--md-warning)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            ⏳
          </div>
        </div>

        {/* Pendaftar Lunas Biaya Registrasi */}
        <div className="md-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Registrasi Lunas
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--md-success)", fontSize: 22, fontWeight: 900 }}>
              {analytics.pendaftarLunasCount} / {analytics.totalPendaftar}
            </p>
            <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
              {formatRupiah(analytics.totalPendaftaranNominal)} pendaftaran
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--md-success-container)", color: "var(--md-success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            🎓
          </div>
        </div>

        {/* Periode Aktif */}
        <div className="md-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Batch Aktif
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--md-on-surface)", fontSize: 15, fontWeight: 900, lineHeight: 1.3 }}>
              {analytics.namaPeriodeAktif}
            </p>
            <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
              {analytics.pendaftarBelumLunasCount} calon pendaftar pending
            </p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--md-surface-2)", color: "var(--md-on-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            📅
          </div>
        </div>
      </div>

      {/* ── 2. VISUALISASI GRAFIK KEUANGAN (TREN KAS & KOMPOSISI SUMBER DANA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Grafik Batang: Tren Penerimaan Kas 6 Bulan Terakhir (~60%) */}
        <div className="lg:col-span-7 xl:col-span-8 md-card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, color: "var(--md-primary)", fontSize: 10.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Arus Kas Masuk
                </p>
                <h3 style={{ margin: "3px 0 0", color: "var(--md-on-surface)", fontSize: 17, fontWeight: 900 }}>
                  Tren Penerimaan Kas (6 Bulan Terakhir)
                </h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "var(--md-surface-2)", color: "var(--md-on-surface-variant)" }}>
                Update Realtime
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, height: 160, padding: "10px 8px 0", borderBottom: "1px solid var(--md-outline-variant)" }}>
              {analytics.monthlyTrends.map((m) => {
                const heightPct = m.total > 0 ? Math.max(Math.round((m.total / maxMonthlyTotal) * 130), 12) : 6;
                return (
                  <div key={m.monthKey} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: m.total > 0 ? "var(--md-primary)" : "var(--md-on-surface-variant)", opacity: m.total > 0 ? 1 : 0.4 }}>
                      {m.total > 0 ? `${(m.total / 1000).toFixed(0)}k` : "Rp 0"}
                    </span>
                    <div
                      title={`${m.label}: ${formatRupiah(m.total)} (${m.count} transaksi)`}
                      style={{
                        width: "100%",
                        maxWidth: 42,
                        height: `${heightPct}px`,
                        borderRadius: "8px 8px 3px 3px",
                        background: m.total > 0
                          ? "linear-gradient(180deg, var(--md-primary) 0%, rgba(37, 99, 235, 0.7) 100%)"
                          : "var(--md-surface-2)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        boxShadow: m.total > 0 ? "0 4px 12px var(--theme-glow)" : "none",
                      }}
                    />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--md-on-surface-variant)", marginTop: 4 }}>
                      {m.label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--md-on-surface-variant)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>💡</span>
            <span>Grafik mencatat seluruh pembayaran berstatus diterima yang telah diverifikasi masuk ke rekening BRI STIMI RPL.</span>
          </p>
        </div>

        {/* Breakdown Donut/Bar: Komposisi Sumber Penerimaan Dana (~40%) */}
        <div className="lg:col-span-5 xl:col-span-4 md-card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "var(--md-primary)", fontSize: 10.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Sumber Pendapatan
            </p>
            <h3 style={{ margin: "3px 0 16px", color: "var(--md-on-surface)", fontSize: 17, fontWeight: 900 }}>
              Komposisi Pembayaran Masuk
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Pendaftaran RPL */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>
                    Biaya Pendaftaran RPL
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "var(--md-primary)" }}>
                    {formatRupiah(analytics.totalPendaftaranNominal)} ({pctPendaftaran}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--md-surface-2)", overflow: "hidden" }}>
                  <div style={{ width: `${pctPendaftaran}%`, height: "100%", borderRadius: 999, background: "var(--md-primary)" }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--md-on-surface-variant)", marginTop: 3, display: "block" }}>
                  {analytics.totalPendaftaranCount} calon mahasiswa terverifikasi
                </span>
              </div>

              {/* Asesmen RPL */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>
                    Biaya Asesmen RPL
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "var(--md-success)" }}>
                    {formatRupiah(analytics.totalAsesmenNominal)} ({pctAsesmen}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--md-surface-2)", overflow: "hidden" }}>
                  <div style={{ width: `${pctAsesmen}%`, height: "100%", borderRadius: 999, background: "var(--md-success)" }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--md-on-surface-variant)", marginTop: 3, display: "block" }}>
                  {analytics.totalAsesmenCount} pembayaran asesmen
                </span>
              </div>

              {/* Tagihan Lainnya */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>
                    Cicilan / Lainnya
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "var(--md-warning)" }}>
                    {formatRupiah(analytics.totalLainnyaNominal)} ({pctLainnya}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--md-surface-2)", overflow: "hidden" }}>
                  <div style={{ width: `${pctLainnya}%`, height: "100%", borderRadius: 999, background: "var(--md-warning)" }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--md-on-surface-variant)", marginTop: 3, display: "block" }}>
                  {analytics.totalLainnyaCount} transaksi cicilan/administrasi
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 12, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>Rekening Penerima:</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "var(--md-primary)" }}>BRI 3419-0106-7835-533</span>
          </div>
        </div>
      </div>

      {/* ── 3. ANTREAN VALIDASI CEPAT (QUICK ACTION) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 22, borderRadius: 99, background: pendingPayments.length > 0 ? "var(--md-warning)" : "var(--md-success)" }} />
            <div>
              <h2 style={{ margin: 0, color: "var(--md-on-surface)", fontSize: 17, fontWeight: 900 }}>
                Antrean Validasi Cepat (Quick Action)
              </h2>
              <p style={{ margin: "2px 0 0", color: "var(--md-on-surface-variant)", fontSize: 11.5, fontWeight: 650 }}>
                Verifikasi transferan baru calon mahasiswa langsung di sini tanpa perlu berpindah halaman.
              </p>
            </div>
          </div>

          <span
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              background: pendingPayments.length > 0 ? "var(--md-warning-container)" : "var(--md-success-container)",
              color: pendingPayments.length > 0 ? "var(--md-warning)" : "var(--md-success)",
              border: pendingPayments.length > 0 ? "1px solid #fde68a" : "1px solid #a7f3d0",
            }}
          >
            {pendingPayments.length > 0 ? `⚠️ ${pendingPayments.length} Menunggu Diproses` : "✓ Antrean Kosong"}
          </span>
        </div>

        {pendingPayments.length > 0 ? (
          <PaymentValidationTable
            rows={pendingPayments}
            showActions={true}
            emptyTitle="Antrean Validasi Kosong"
            emptyMessage="Semua bukti transfer mahasiswa telah selesai diperiksa."
          />
        ) : (
          <div className="md-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 14, background: "var(--md-success-container)", border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: 26 }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--md-success)" }}>
                Semua Pembayaran Beres Terverifikasi
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--md-on-surface-variant)" }}>
                Tidak ada pembayaran yang tertahan di antrean. Mahasiswa yang baru mentransfer uang akan otomatis muncul di baris ini.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. REKAPITULASI & HISTORI TRANSAKSI KESELURUHAN ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 22, borderRadius: 99, background: "var(--md-primary)" }} />
            <div>
              <h2 style={{ margin: 0, color: "var(--md-on-surface)", fontSize: 17, fontWeight: 900 }}>
                Histori &amp; Rekapitulasi Pembayaran
              </h2>
              <p style={{ margin: "2px 0 0", color: "var(--md-on-surface-variant)", fontSize: 11.5, fontWeight: 650 }}>
                Seluruh catatan transaksi keuangan yang masuk ke rekening resmi RPL.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Cari mahasiswa, NIM, atau jenis bayar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                minHeight: 36,
                minWidth: 260,
                borderRadius: 999,
                border: "1px solid var(--md-outline-variant)",
                background: "var(--md-surface-1)",
                color: "var(--md-on-surface)",
                padding: "0 16px",
                fontSize: 12,
                fontWeight: 600,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--md-outline-variant)", paddingBottom: 10 }}>
          {[
            { key: "semua", label: `Semua Transaksi (${payments.length})` },
            { key: "Diterima", label: `✓ Diterima (${analytics.totalAcceptedCount})` },
            { key: "Proses", label: `⏳ Menunggu (${analytics.totalPendingCount})` },
            { key: "Ditolak", label: `✕ Ditolak (${analytics.totalRejectedCount})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                  background: isSelected ? "var(--md-primary-container)" : "var(--md-surface-2)",
                  color: isSelected ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                  boxShadow: isSelected ? "0 2px 8px var(--theme-glow)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tabel Rekap */}
        <PaymentValidationTable
          rows={filteredHistory}
          showActions={false}
          emptyTitle="Tidak ada riwayat transaksi"
          emptyMessage={
            searchQuery
              ? `Tidak ditemukan transaksi dengan kata kunci "${searchQuery}".`
              : "Belum ada transaksi pembayaran pada kategori ini."
          }
        />
      </div>

    </div>
  );
}
