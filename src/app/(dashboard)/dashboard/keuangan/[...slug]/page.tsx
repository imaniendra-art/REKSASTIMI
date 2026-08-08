import { notFound } from "next/navigation";
import { formatRupiah, getFinancePayments } from "../data";
import { PaymentValidationTable } from "../PaymentValidationTable";

export default async function KeuanganSubPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = slug[0];

  if (!["rekap", "validasi"].includes(page)) {
    notFound();
  }

  const payments = await getFinancePayments();
  const rows = page === "validasi" ? payments.filter((item) => item.statusVerifikasi === "Proses") : payments;
  const acceptedTotal = payments
    .filter((item) => item.statusVerifikasi === "Diterima")
    .reduce((sum, item) => sum + item.nominal, 0);

  const isValidation = page === "validasi";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "var(--md-primary)", fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>Menu Keuangan</p>
          <h1 style={{ marginTop: 4, color: "var(--md-on-surface)", fontSize: 26, fontWeight: 900, textTransform: "uppercase" }}>
            {isValidation ? "Antrean Validasi Pembayaran" : "Rekapitulasi Dana"}
          </h1>
          <p style={{ marginTop: 4, color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 700 }}>
            {isValidation ? "Periksa bukti bayar mahasiswa dan tentukan status validasinya." : "Lihat seluruh riwayat pembayaran yang masuk ke sistem."}
          </p>
        </div>
        <div style={{ marginLeft: "auto", borderRadius: 16, background: "var(--md-primary)", color: "#fff", padding: "12px 18px", minWidth: 190 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.78 }}>Dana Terverifikasi</div>
          <div style={{ marginTop: 3, fontSize: 18, fontWeight: 900 }}>{formatRupiah(acceptedTotal)}</div>
        </div>
      </div>

      <PaymentValidationTable
        rows={rows}
        showActions={isValidation}
        emptyTitle={isValidation ? "Tidak ada antrean validasi" : "Belum ada rekap pembayaran"}
        emptyMessage={isValidation ? "Semua bukti pembayaran mahasiswa sudah diproses." : "Data rekap akan tampil setelah mahasiswa mengirim bukti pembayaran."}
      />
    </div>
  );
}
