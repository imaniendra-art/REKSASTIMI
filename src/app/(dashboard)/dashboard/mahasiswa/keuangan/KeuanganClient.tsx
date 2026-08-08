"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitPayment } from "./actions";

type PaymentHistory = {
  _id: string;
  jenisPembayaran: string;
  tanggalBayar: string;
  nominal: number;
  keterangan?: string;
  statusVerifikasi: "Proses" | "Diterima" | "Ditolak";
  catatanAdmin?: string;
};

function StatusBadge({ status }: { status: PaymentHistory["statusVerifikasi"] }) {
  const style =
    status === "Diterima"
      ? { background: "var(--md-success-container)", color: "var(--md-success)", border: "1px solid #a7f3d0" }
      : status === "Ditolak"
        ? { background: "var(--md-error-container)", color: "var(--md-error)", border: "1px solid #fecaca" }
        : { background: "var(--md-warning-container)", color: "var(--md-warning)", border: "1px solid #fde68a" };

  return (
    <span style={{ ...style, display: "inline-flex", borderRadius: 999, padding: "5px 10px", fontSize: 10, fontWeight: 900 }}>
      {status}
    </span>
  );
}

export default function KeuanganClient({ histori }: { histori: PaymentHistory[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fileName, setFileName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const result = await submitPayment(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Bukti pembayaran berhasil dikirim." });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      e.currentTarget.reset();
      setFileName("");
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Terjadi kesalahan." });
    }

    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, alignItems: "start" }}>
      <div>
        <div className="md-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)" }}>
            <p style={{ color: "var(--md-primary)", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>Form Pembayaran</p>
            <h2 style={{ marginTop: 4, color: "var(--md-on-surface)", fontSize: 18, fontWeight: 900 }}>Konfirmasi Bayar</h2>
            <p style={{ marginTop: 4, color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 650, lineHeight: 1.6 }}>Unggah bukti transfer agar tim keuangan dapat melakukan validasi.</p>
          </div>

          <div style={{ padding: 20 }}>
            {message.text && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  border: message.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5",
                  background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: message.type === "success" ? "#047857" : "#b91c1c",
                  padding: 12,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>
                  Jenis Pembayaran <span className="text-red-500">*</span>
                </label>
                <select name="jenis" required defaultValue="" style={fieldStyle}>
                  <option value="" disabled>- Pilih Jenis Pembayaran -</option>
                  <option value="Biaya Pendaftaran RPL">Biaya Pendaftaran RPL</option>
                  <option value="Biaya Asesmen RPL">Biaya Asesmen RPL</option>
                  <option value="Pembayaran Cicilan RPL">Pembayaran Cicilan RPL</option>
                  <option value="Pembayaran Pelunasan RPL">Pembayaran Pelunasan RPL</option>
                  <option value="Pembayaran Jurnal / Skripsi">Pembayaran Jurnal / Skripsi</option>
                  <option value="Pembayaran Wisuda">Pembayaran Wisuda</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Tanggal Transfer <span className="text-red-500">*</span>
                </label>
                <input type="date" name="tanggal_bayar" required style={fieldStyle} />
              </div>

              <div>
                <label style={labelStyle}>
                  Nominal Transfer <span className="text-red-500">*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "54px minmax(0, 1fr)" }}>
                  <span style={{ minHeight: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--md-outline-variant)", borderRight: 0, borderRadius: "12px 0 0 12px", background: "var(--md-primary-container)", color: "var(--md-primary)", fontSize: 13, fontWeight: 900 }}>
                    Rp
                  </span>
                  <input type="number" name="nominal" required placeholder="Contoh: 500000" style={{ ...fieldStyle, borderRadius: "0 12px 12px 0" }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Berita / Keterangan
                </label>
                <textarea name="keterangan" rows={3} placeholder="Sebutkan bank, nama pengirim, atau keterangan pembayaran" style={{ ...fieldStyle, height: 88, resize: "vertical", paddingTop: 12 }} />
              </div>

              <div>
                <label style={labelStyle}>
                  Unggah Bukti <span className="text-red-500">*</span>
                </label>
                <div style={{ border: "1.5px dashed #93c5fd", borderRadius: 14, background: "#eff6ff", padding: 14 }}>
                  <label
                    htmlFor="bukti-pembayaran"
                    style={{
                      minHeight: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      borderRadius: 12,
                      background: "var(--md-primary)",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: "var(--md-shadow-2)",
                      fontSize: 13,
                      fontWeight: 900,
                      textAlign: "center",
                    }}
                  >
                    Pilih File Bukti Transfer
                  </label>
                  <input
                    id="bukti-pembayaran"
                    type="file"
                    name="bukti"
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                    onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name || "")}
                    style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
                  />
                  <p style={{ marginTop: 10, color: fileName ? "var(--md-primary)" : "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textAlign: "center" }}>
                    {fileName || "Belum ada file dipilih"}
                  </p>
                  <p style={{ marginTop: 5, color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 700, textAlign: "center" }}>Format JPG, PNG, atau PDF. Maksimal 5 MB.</p>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ minHeight: 48, marginTop: 4, border: 0, borderRadius: 999, background: "var(--md-primary)", color: "#fff", cursor: loading ? "wait" : "pointer", boxShadow: "var(--md-shadow-2)", fontSize: 13, fontWeight: 900, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="md-card" style={{ overflow: "hidden", minHeight: 420 }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ color: "var(--md-primary)", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>Histori</p>
              <h2 style={{ marginTop: 4, color: "var(--md-on-surface)", fontSize: 18, fontWeight: 900 }}>Riwayat Transaksi</h2>
            </div>
            <span style={{ flexShrink: 0, borderRadius: 999, background: "#fff", color: "var(--md-on-surface-variant)", border: "1px solid var(--md-outline-variant)", padding: "6px 12px", fontSize: 10, fontWeight: 900 }}>
              {histori.length} Transaksi
            </span>
          </div>

          {histori.length === 0 ? (
            <div style={{ minHeight: 330, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ maxWidth: 360, textAlign: "center" }}>
                <div style={{ width: 62, height: 62, margin: "0 auto 14px", borderRadius: 18, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>Rp</div>
                <p style={{ color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>Belum ada riwayat transaksi</p>
                <p style={{ marginTop: 6, color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 650, lineHeight: 1.6 }}>
                  Setelah bukti pembayaran dikirim, status validasi dan catatan keuangan akan tampil di sini.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--md-outline-variant)" }}>
                    {["Tanggal", "Keterangan", "Nominal", "Status"].map((heading) => (
                      <th key={heading} style={{ padding: "13px 18px", color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {histori.map((h) => (
                    <tr key={h._id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                      <td style={{ padding: "16px 18px", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 750, whiteSpace: "nowrap" }}>
                        {new Date(h.tanggalBayar).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ color: "var(--md-primary)", fontSize: 12, fontWeight: 900 }}>{h.jenisPembayaran}</div>
                        <div style={{ marginTop: 3, color: "var(--md-on-surface-variant)", fontSize: 10, fontWeight: 650 }}>{h.keterangan || "-"}</div>
                        {h.statusVerifikasi === "Ditolak" && h.catatanAdmin && (
                          <div style={{ marginTop: 8, borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", padding: 9 }}>
                            <div style={{ marginBottom: 2, color: "var(--md-error)", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Alasan Ditolak</div>
                            <div style={{ color: "#b91c1c", fontSize: 10, fontWeight: 650 }}>{h.catatanAdmin}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 18px", color: "var(--md-on-surface)", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
                        Rp {h.nominal.toLocaleString("id-ID")}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <StatusBadge status={h.statusVerifikasi} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: "var(--md-on-surface-variant)",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  background: "var(--md-surface-2)",
  color: "var(--md-on-surface)",
  padding: "0 13px",
  outline: "none",
  fontSize: 13,
  fontWeight: 750,
};
