"use client";

import { useState, useMemo } from "react";
import { formatRupiah, formatDate, type FinanceAnalytics, type FinancePaymentRow } from "../types";

type LaporanClientProps = {
  payments: FinancePaymentRow[];
  analytics: FinanceAnalytics;
};

export function LaporanClient({ payments, analytics }: LaporanClientProps) {
  const [filterStatus, setFilterStatus] = useState<"semua" | "Diterima" | "Proses" | "Ditolak">("semua");
  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    return payments.filter((item) => {
      const matchStatus = filterStatus === "semua" || item.statusVerifikasi === filterStatus;
      const matchJenis = filterJenis === "semua" || item.jenisPembayaran.toLowerCase().includes(filterJenis.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        item.studentEmail.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q);

      return matchStatus && matchJenis && matchSearch;
    });
  }, [payments, filterStatus, filterJenis, searchQuery]);

  // Aggregates for filtered data
  const totalNominalFiltered = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.statusVerifikasi === "Diterima" ? item.nominal : 0), 0);
  }, [filteredData]);

  const totalAcceptedCount = useMemo(() => {
    return filteredData.filter((item) => item.statusVerifikasi === "Diterima").length;
  }, [filteredData]);

  // CSV Exporter with UTF-8 BOM for Microsoft Excel compatibility
  const handleExportCSV = () => {
    const headers = [
      "No",
      "No Registrasi",
      "Nama Mahasiswa",
      "Email",
      "Periode",
      "Jenis Pembayaran",
      "Nominal (Rp)",
      "Tanggal Bayar",
      "Status Verifikasi",
      "Catatan / Keterangan",
      "Link Bukti Struk"
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      `"${item.registrationNumber !== "-" ? item.registrationNumber : "Belum Ada"}"`,
      `"${item.studentName.replace(/"/g, '""')}"`,
      `"${item.studentEmail}"`,
      `"${item.periodName}"`,
      `"${item.jenisPembayaran}"`,
      item.nominal,
      `"${formatDate(item.tanggalBayar)}"`,
      `"${item.statusVerifikasi}"`,
      `"${(item.keterangan || item.catatanAdmin || "").replace(/"/g, '""')}"`,
      `"${item.buktiBayar || "-"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_keuangan_rpl_stimi_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* ── 1. RINGKASAN REKAPITULASI DANA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md-card" style={{ padding: "18px 20px" }}>
          <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
            Total Kas Terverifikasi
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--md-primary)", fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
            {formatRupiah(totalNominalFiltered)}
          </p>
          <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
            Dari {totalAcceptedCount} transaksi terverifikasi
          </p>
        </div>

        <div className="md-card" style={{ padding: "18px 20px" }}>
          <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
            Total Record Transaksi
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--md-on-surface)", fontSize: 22, fontWeight: 900 }}>
            {filteredData.length} Baris
          </p>
          <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
            Sesuai kriteria filter saat ini
          </p>
        </div>

        <div className="md-card" style={{ padding: "18px 20px" }}>
          <p style={{ margin: 0, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
            Periode Akademik
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>
            {analytics.namaPeriodeAktif}
          </p>
          <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 650 }}>
            Tahun Ajaran Aktif
          </p>
        </div>

        <div className="md-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              width: "100%",
              minHeight: 42,
              borderRadius: 12,
              border: "1.5px solid var(--md-primary)",
              background: "var(--md-primary)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px var(--theme-glow)",
              transition: "all 0.2s ease",
            }}
          >
            <span>📥</span>
            <span>Ekspor Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. BAR FILTER & PENCARIAN DATA ── */}
      <div className="md-card" style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1, minWidth: 280 }}>
          {/* Search Box */}
          <input
            type="text"
            placeholder="Cari nama, NIM/reg, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1 1 240px",
              minHeight: 38,
              borderRadius: 10,
              border: "1px solid var(--md-outline-variant)",
              background: "var(--md-surface)",
              color: "var(--md-on-surface)",
              padding: "0 14px",
              fontSize: 12.5,
              fontWeight: 600,
              outline: "none",
            }}
          />

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              minHeight: 38,
              borderRadius: 10,
              border: "1px solid var(--md-outline-variant)",
              background: "var(--md-surface)",
              color: "var(--md-on-surface)",
              padding: "0 12px",
              fontSize: 12,
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="semua">Semua Status</option>
            <option value="Diterima">Hanya Diterima</option>
            <option value="Proses">Hanya Menunggu (Proses)</option>
            <option value="Ditolak">Hanya Ditolak</option>
          </select>

          {/* Filter Jenis */}
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            style={{
              minHeight: 38,
              borderRadius: 10,
              border: "1px solid var(--md-outline-variant)",
              background: "var(--md-surface)",
              color: "var(--md-on-surface)",
              padding: "0 12px",
              fontSize: 12,
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="semua">Semua Pos Pembayaran</option>
            <option value="pendaftaran">Biaya Pendaftaran RPL</option>
            <option value="asesmen">Biaya Asesmen RPL</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
            Menampilkan {filteredData.length} dari {payments.length} transaksi
          </span>
        </div>
      </div>

      {/* ── 3. TABEL AUDIT PEMBUKUAN LENGKAP ── */}
      <div className="md-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 940, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
                {["No", "Nama Mahasiswa", "NIM / Registrasi", "Jenis Pembayaran", "Nominal", "Tanggal Bayar", "Status", "Keterangan"].map((h) => (
                  <th key={h} style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 36, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 650 }}>
                    Tidak ada data transaksi yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                    <td style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <p style={{ margin: 0, color: "var(--md-on-surface)", fontSize: 13, fontWeight: 850 }}>{item.studentName}</p>
                      <p style={{ margin: "2px 0 0", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 600 }}>{item.studentEmail}</p>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface)", fontSize: 12, fontWeight: 800 }}>
                      {item.registrationNumber !== "-" ? item.registrationNumber : "Calon Pendaftar"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface)", fontSize: 12, fontWeight: 750 }}>
                      {item.jenisPembayaran}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-primary)", fontSize: 13.5, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                      {formatRupiah(item.nominal)}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {formatDate(item.tanggalBayar)}
                    </td>
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 10.5,
                          fontWeight: 800,
                          background:
                            item.statusVerifikasi === "Diterima"
                              ? "var(--md-success-container)"
                              : item.statusVerifikasi === "Ditolak"
                              ? "var(--md-error-container)"
                              : "var(--md-warning-container)",
                          color:
                            item.statusVerifikasi === "Diterima"
                              ? "var(--md-success)"
                              : item.statusVerifikasi === "Ditolak"
                              ? "var(--md-error)"
                              : "var(--md-warning)",
                        }}
                      >
                        {item.statusVerifikasi}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 600, maxWidth: 220 }}>
                      {item.keterangan || item.catatanAdmin || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
