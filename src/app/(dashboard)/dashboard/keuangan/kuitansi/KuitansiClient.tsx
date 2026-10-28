"use client";

import { useState, useMemo } from "react";
import { formatRupiah, formatDate, type FinancePaymentRow } from "../types";
import { terbilangRupiah } from "./utils";
import type { FinanceSettingsData } from "@/lib/finance-settings";

type KuitansiClientProps = {
  payments: FinancePaymentRow[];
  settings: FinanceSettingsData;
};

export function KuitansiClient({ payments, settings }: KuitansiClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<FinancePaymentRow | null>(null);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.registrationNumber.toLowerCase().includes(q) ||
        p.studentEmail.toLowerCase().includes(q) ||
        p.jenisPembayaran.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* ── 1. HEADER & SEARCH BAR ── */}
      <div className="md-card" style={{ padding: "18px 20px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>
            Arsip Kuitansi Terbit ({payments.length} Pembayaran Sah)
          </h3>
          <p style={{ margin: "3px 0 0", color: "var(--md-on-surface-variant)", fontSize: 11.5, fontWeight: 650 }}>
            Hanya transaksi yang telah diverifikasi dan dana masuk yang dapat diterbitkan tanda terimanya.
          </p>
        </div>

        <input
          type="text"
          placeholder="Cari nama mahasiswa / No. Reg..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            minWidth: 260,
            minHeight: 38,
            borderRadius: 10,
            border: "1px solid var(--md-outline-variant)",
            background: "var(--md-surface)",
            color: "var(--md-on-surface)",
            padding: "0 14px",
            fontSize: 12,
            fontWeight: 600,
            outline: "none",
          }}
        />
      </div>

      {/* ── 2. TABEL DAFTAR KUITANSI ── */}
      <div className="md-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
                {["No. Kuitansi", "Nama Mahasiswa", "NIM / Registrasi", "Pos Pembayaran", "Nominal", "Tanggal Bayar", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 650 }}>
                    {payments.length === 0 ? "Belum ada transaksi pembayaran yang diverifikasi diterima." : "Data tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item, idx) => {
                  const receiptNo = `KW-${new Date(item.tanggalBayar).getFullYear()}/${item.registrationNumber !== "-" ? item.registrationNumber : String(item.id).slice(-6).toUpperCase()}/${String(idx + 1).padStart(2, "0")}`;

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                      <td style={{ padding: "14px 18px", color: "var(--md-primary)", fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap" }}>
                        {receiptNo}
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
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(item)}
                          style={{
                            minHeight: 32,
                            padding: "6px 14px",
                            borderRadius: 999,
                            border: "1.5px solid var(--md-primary)",
                            background: "var(--md-primary-container)",
                            color: "var(--md-primary)",
                            fontSize: 11.5,
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span>🧾</span>
                          <span>Buka Kuitansi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. MODAL CETAK KUITANSI RESMI STIMI YAPMI ── */}
      {selectedReceipt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReceipt(null);
          }}
        >
          <div
            className="md-card receipt-modal-box"
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 0,
              background: "#ffffff",
              color: "#1e293b",
              borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Action Bar (Top) */}
            <div
              className="no-print"
              style={{
                padding: "12px 20px",
                background: "#f1f5f9",
                borderBottom: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>
                Preview Tanda Terima Resmi
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>🖨️</span>
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div id="receipt-print-area" style={{ padding: "32px 36px", background: "#ffffff", color: "#0f172a" }}>
              {/* Header / Kop */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "2.5px solid #0f172a", paddingBottom: 14, marginBottom: 20 }}>
                <img
                  src="/icon-logo-reksa.png"
                  alt="Logo STIMI YAPMI"
                  style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }}
                />
                <div style={{ textAlign: "center", width: "100%" }}>
                  <h4 style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569" }}>
                    YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA
                  </h4>
                  <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>
                    SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI YAPMI)
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#64748b", fontWeight: 600 }}>
                    Jl. Perintis Kemerdekaan KM. 9 Tamalanrea, Makassar - Sulawesi Selatan | Email: info@stimiyapmi.ac.id
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10.5, fontWeight: 800, color: "#0284c7" }}>
                    PROGRAM REKOGNISI PEMBELAJARAN LAMPAU (RPL TIPE A)
                  </p>
                </div>
              </div>

              {/* Title & Receipt Number */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, textDecoration: "underline", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  KUITANSI TANDA TERIMA PEMBAYARAN
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  Nomor: KW-{new Date(selectedReceipt.tanggalBayar).getFullYear()}/{selectedReceipt.registrationNumber !== "-" ? selectedReceipt.registrationNumber : String(selectedReceipt.id).slice(-6).toUpperCase()}/01
                </p>
              </div>

              {/* Body Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5, lineHeight: 1.6 }}>
                <div style={{ display: "flex" }}>
                  <span style={{ width: 180, fontWeight: 700, color: "#475569" }}>Telah Diterima Dari</span>
                  <span style={{ width: 15, fontWeight: 700 }}>:</span>
                  <span style={{ flex: 1, fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>
                    {selectedReceipt.studentName}
                  </span>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: 180, fontWeight: 700, color: "#475569" }}>No. Registrasi / NIM</span>
                  <span style={{ width: 15, fontWeight: 700 }}>:</span>
                  <span style={{ flex: 1, fontWeight: 800, color: "#0f172a" }}>
                    {selectedReceipt.registrationNumber !== "-" ? selectedReceipt.registrationNumber : "Calon Pendaftar RPL"}
                  </span>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: 180, fontWeight: 700, color: "#475569" }}>Uang Sejumlah</span>
                  <span style={{ width: 15, fontWeight: 700 }}>:</span>
                  <span style={{ flex: 1, fontWeight: 800, fontStyle: "italic", background: "#f8fafc", padding: "4px 8px", borderRadius: 4, border: "1px dashed #cbd5e1", color: "#0f172a" }}>
                    &ldquo;{terbilangRupiah(selectedReceipt.nominal)}&rdquo;
                  </span>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: 180, fontWeight: 700, color: "#475569" }}>Untuk Pembayaran</span>
                  <span style={{ width: 15, fontWeight: 700 }}>:</span>
                  <span style={{ flex: 1, fontWeight: 700, color: "#0f172a" }}>
                    {selectedReceipt.jenisPembayaran} Program RPL Sarjana Manajemen (S.M.) &bull; {selectedReceipt.periodName}
                  </span>
                </div>

                <div style={{ display: "flex" }}>
                  <span style={{ width: 180, fontWeight: 700, color: "#475569" }}>Keterangan Transaksi</span>
                  <span style={{ width: 15, fontWeight: 700 }}>:</span>
                  <span style={{ flex: 1, color: "#64748b", fontSize: 11.5 }}>
                    {selectedReceipt.keterangan || "Transfer Rekening BRI Bank Kampus (Mutasi Berhasil Diverifikasi)"}
                  </span>
                </div>
              </div>

              {/* Bottom Box & Signatures */}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                {/* Nominal Badge */}
                <div
                  style={{
                    border: "2px solid #0f172a",
                    borderRadius: 8,
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    display: "inline-block",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>
                    Jumlah Dibayar:
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
                    {formatRupiah(selectedReceipt.nominal)}
                  </p>
                </div>

                {/* Signature Box */}
                <div style={{ textAlign: "center", minWidth: 200 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#475569", fontWeight: 700 }}>
                    Makassar, {formatDate(selectedReceipt.tanggalBayar)}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 800, color: "#0f172a" }}>
                    Bagian Keuangan / Bendahara RPL,
                  </p>

                  {/* Stamp & Sig Placeholder */}
                  <div style={{ margin: "10px auto", width: 90, height: 50, border: "1.5px dashed #0284c7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7", fontSize: 10, fontWeight: 800 }}>
                    [ LUNAS / SAH ]
                  </div>

                  <p style={{ margin: 0, fontSize: 12, fontWeight: 900, textDecoration: "underline", color: "#0f172a" }}>
                    {settings.treasurerName}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 9.5, color: "#64748b", fontWeight: 600 }}>
                    NIP / NIDN: 0914027501
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Clean Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
