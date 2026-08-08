import Link from "next/link";
import { verifyPayment } from "./actions";
import { formatDate, formatRupiah, type FinancePaymentRow } from "./data";

type PaymentValidationTableProps = {
  rows: FinancePaymentRow[];
  showActions?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

function StatusBadge({ status }: { status: FinancePaymentRow["statusVerifikasi"] }) {
  const style =
    status === "Diterima"
      ? { background: "var(--md-success-container)", color: "var(--md-success)", border: "1px solid #a7f3d0" }
      : status === "Ditolak"
        ? { background: "var(--md-error-container)", color: "var(--md-error)", border: "1px solid #fecaca" }
        : { background: "var(--md-warning-container)", color: "var(--md-warning)", border: "1px solid #fde68a" };

  return <span style={{ ...style, display: "inline-flex", borderRadius: 999, padding: "5px 10px", fontSize: 10, fontWeight: 900 }}>{status}</span>;
}

export function PaymentValidationTable({
  rows,
  showActions = true,
  emptyTitle = "Tidak ada antrean pembayaran",
  emptyMessage = "Semua bukti pembayaran mahasiswa sudah diproses.",
}: PaymentValidationTableProps) {
  if (rows.length === 0) {
    return (
      <div className="md-card" style={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ width: 62, height: 62, margin: "0 auto 14px", borderRadius: 18, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>Rp</div>
          <p style={{ color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>{emptyTitle}</p>
          <p style={{ marginTop: 6, color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 650, lineHeight: 1.6 }}>{emptyMessage}</p>
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
              {["Mahasiswa", "Detail Transfer", "Tanggal", "Status", "Bukti", showActions ? "Validasi" : "Catatan"].map((heading) => (
                <th key={heading} style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                <td style={{ padding: "16px 18px", minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>
                      {item.studentName.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: "var(--md-on-surface)", fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>{item.studentName}</p>
                      <p style={{ marginTop: 3, color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 700 }}>{item.registrationNumber} - {item.periodName}</p>
                      <p style={{ marginTop: 2, color: "#94a3b8", fontSize: 10, fontWeight: 650 }}>{item.studentEmail}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 18px", minWidth: 260 }}>
                  <p style={{ color: "var(--md-primary)", fontSize: 14, fontWeight: 900 }}>{formatRupiah(item.nominal)}</p>
                  <p style={{ marginTop: 3, color: "var(--md-on-surface)", fontSize: 11, fontWeight: 800 }}>{item.jenisPembayaran}</p>
                  {item.keterangan && <p style={{ marginTop: 5, maxWidth: 280, color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 650, lineHeight: 1.5 }}>{item.keterangan}</p>}
                </td>
                <td style={{ padding: "16px 18px", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                  {formatDate(item.tanggalBayar)}
                </td>
                <td style={{ padding: "16px 18px" }}>
                  <StatusBadge status={item.statusVerifikasi} />
                </td>
                <td style={{ padding: "16px 18px" }}>
                  <Link href={item.buktiBayar} target="_blank" style={{ minHeight: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: "1px solid var(--md-outline)", background: "#fff", color: "var(--md-primary)", padding: "8px 13px", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>
                    Lihat Bukti
                  </Link>
                </td>
                <td style={{ padding: "16px 18px", minWidth: showActions ? 310 : 180 }}>
                  {showActions ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <form action={verifyPayment}>
                        <input type="hidden" name="paymentId" value={item.id} />
                        <input type="hidden" name="status" value="Diterima" />
                        <button type="submit" style={{ width: "100%", minHeight: 34, border: 0, borderRadius: 999, background: "var(--md-success)", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 900 }}>
                          Terima Pembayaran
                        </button>
                      </form>
                      <form action={verifyPayment} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8 }}>
                        <input type="hidden" name="paymentId" value={item.id} />
                        <input type="hidden" name="status" value="Ditolak" />
                        <input name="catatanAdmin" placeholder="Catatan penolakan" style={{ minHeight: 34, minWidth: 0, border: "1px solid var(--md-outline-variant)", borderRadius: 999, background: "var(--md-surface-2)", padding: "0 12px", color: "var(--md-on-surface)", fontSize: 11, fontWeight: 700, outline: "none" }} />
                        <button type="submit" style={{ minHeight: 34, border: 0, borderRadius: 999, background: "var(--md-error)", color: "#fff", cursor: "pointer", padding: "0 14px", fontSize: 11, fontWeight: 900 }}>
                          Tolak
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 700 }}>{item.catatanAdmin || "-"}</span>
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
