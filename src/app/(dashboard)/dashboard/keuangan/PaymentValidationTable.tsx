"use client";

import Link from "next/link";
import { verifyPayment } from "./actions";
import { formatDate, formatRupiah, type FinancePaymentRow } from "./types";

type PaymentValidationTableProps = {
  rows: FinancePaymentRow[];
  showActions?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

function StatusBadge({ status }: { status: FinancePaymentRow["statusVerifikasi"] }) {
  const style =
    status === "Diterima"
      ? { background: "var(--md-success-container)", color: "var(--md-success)", border: "1px solid rgba(16, 185, 129, 0.3)" }
      : status === "Ditolak"
        ? { background: "var(--md-error-container)", color: "var(--md-error)", border: "1px solid rgba(239, 68, 68, 0.3)" }
        : { background: "var(--md-warning-container)", color: "var(--md-warning)", border: "1px solid rgba(245, 158, 11, 0.3)" };

  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 900 }}>
      <span>{status === "Diterima" ? "✓" : status === "Ditolak" ? "✕" : "⏳"}</span>
      <span>{status}</span>
    </span>
  );
}

export function PaymentValidationTable({
  rows,
  showActions = true,
  emptyTitle = "Tidak ada transaksi pembayaran",
  emptyMessage = "Belum ada transaksi pembayaran yang tercatat.",
}: PaymentValidationTableProps) {
  if (rows.length === 0) {
    return (
      <div className="md-card" style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 12px", borderRadius: 16, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 }}>
            💰
          </div>
          <p style={{ color: "var(--md-on-surface)", fontSize: 15, fontWeight: 900 }}>{emptyTitle}</p>
          <p style={{ marginTop: 4, color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md-card" style={{ overflow: "hidden", padding: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
              {["Nama Mahasiswa", "Detail Transaksi", "Tanggal Transfer", "Status", "Bukti Struk Bank", showActions ? "Tindakan Validasi" : "Catatan Admin"].map((heading) => (
                <th key={heading} style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                {/* Mahasiswa Info */}
                <td style={{ padding: "16px 18px", minWidth: 230 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                      {item.studentName.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: "var(--md-on-surface)", fontSize: 13.5, fontWeight: 900, lineHeight: 1.25 }}>{item.studentName}</p>
                      <p style={{ marginTop: 3, color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 700 }}>
                        {item.registrationNumber !== "-" ? item.registrationNumber : "Calon Pendaftar"} &bull; {item.periodName}
                      </p>
                      <p style={{ marginTop: 2, color: "var(--md-on-surface-variant)", opacity: 0.8, fontSize: 10, fontWeight: 600 }}>{item.studentEmail}</p>
                    </div>
                  </div>
                </td>

                {/* Detail Transfer */}
                <td style={{ padding: "16px 18px", minWidth: 240 }}>
                  <p style={{ color: "var(--md-primary)", fontSize: 15, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{formatRupiah(item.nominal)}</p>
                  <p style={{ marginTop: 2, color: "var(--md-on-surface)", fontSize: 11.5, fontWeight: 800 }}>{item.jenisPembayaran}</p>
                  {item.keterangan && (
                    <p style={{ marginTop: 4, maxWidth: 260, color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 600, lineHeight: 1.4 }}>
                      {item.keterangan}
                    </p>
                  )}
                </td>

                {/* Tanggal */}
                <td style={{ padding: "16px 18px", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                  {formatDate(item.tanggalBayar)}
                </td>

                {/* Status */}
                <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                  <StatusBadge status={item.statusVerifikasi} />
                </td>

                {/* Bukti Bayar Bank (Khusus Keuangan Murni, Zero Academic SS) */}
                <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                  {item.buktiBayar ? (
                    <Link
                      href={item.buktiBayar}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        minHeight: 34,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 999,
                        border: "1.5px solid var(--md-primary)",
                        background: "var(--md-primary-container)",
                        color: "var(--md-on-primary-container)",
                        padding: "7px 15px",
                        fontSize: 11.5,
                        fontWeight: 900,
                        textDecoration: "none",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span>🧾</span>
                      <span>Struk BRI</span>
                      <span style={{ fontSize: 9 }}>↗</span>
                    </Link>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--md-error)", fontWeight: 700 }}>Tidak ada file</span>
                  )}
                </td>

                {/* Tindakan Validasi */}
                <td style={{ padding: "16px 18px", minWidth: showActions ? 280 : 160 }}>
                  {showActions ? (
                    <div style={{ display: "grid", gap: 7 }}>
                      {/* Tombol Terima */}
                      <form action={verifyPayment}>
                        <input type="hidden" name="paymentId" value={item.id} />
                        <input type="hidden" name="status" value="Diterima" />
                        <button
                          type="submit"
                          style={{
                            width: "100%",
                            minHeight: 34,
                            border: 0,
                            borderRadius: 999,
                            background: "var(--md-success)",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 11.5,
                            fontWeight: 900,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                          }}
                        >
                          <span>✓</span>
                          <span>Terima Pembayaran</span>
                        </button>
                      </form>

                      {/* Form Tolak */}
                      <form action={verifyPayment} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 6 }}>
                        <input type="hidden" name="paymentId" value={item.id} />
                        <input type="hidden" name="status" value="Ditolak" />
                        <input
                          name="catatanAdmin"
                          placeholder="Alasan tolak..."
                          style={{
                            minHeight: 32,
                            minWidth: 0,
                            border: "1px solid var(--md-outline-variant)",
                            borderRadius: 999,
                            background: "var(--md-surface-2)",
                            padding: "0 12px",
                            color: "var(--md-on-surface)",
                            fontSize: 11,
                            fontWeight: 600,
                            outline: "none",
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            minHeight: 32,
                            border: 0,
                            borderRadius: 999,
                            background: "var(--md-error)",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "0 14px",
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          Tolak
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 700 }}>
                      {item.catatanAdmin || "-"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
