import { PageHero } from "@/components/dashboard/UIComponents";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Payment } from "@/models/Payment";
import { getFinanceSettings } from "@/lib/finance-settings";
import KeuanganClient from "./KeuanganClient";

export default async function MahasiswaKeuanganPage() {
  await connectMongoDB();
  const [session, settings] = await Promise.all([
    getSession(),
    getFinanceSettings(),
  ]);

  if (!session?.id || session.role !== "mahasiswa") {
    return <div>Unauthorized</div>;
  }

  const historiDoc = await Payment.find({ userId: session.id }).sort({ tanggalBayar: -1 }).lean();
  const histori = historiDoc.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    tanggalBayar: doc.tanggalBayar.toISOString(),
    keterangan: doc.keterangan || "",
    catatanAdmin: doc.catatanAdmin || "",
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const acceptedRegistrationPayment = await Payment.exists({
    userId: session.id,
    statusVerifikasi: "Diterima",
    jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
  });

  const pendingRegistrationPaymentDoc = await Payment.findOne({
    userId: session.id,
    statusVerifikasi: "Proses",
    jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
  }).sort({ createdAt: -1 }).lean();

  const rejectedRegistrationPaymentDoc = await Payment.findOne({
    userId: session.id,
    statusVerifikasi: "Ditolak",
    jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
  }).sort({ createdAt: -1 }).lean();

  const totalDana = histori.reduce((acc, curr) => {
    return curr.statusVerifikasi === "Diterima" ? acc + curr.nominal : acc;
  }, 0);

  const prosesCount = histori.filter((item) => item.statusVerifikasi === "Proses").length;
  const diterimaCount = histori.filter((item) => item.statusVerifikasi === "Diterima").length;
  const ditolakCount = histori.filter((item) => item.statusVerifikasi === "Ditolak").length;
  const isRegistrationAccepted = Boolean(acceptedRegistrationPayment);

  const pendingRegistrationPayment = pendingRegistrationPaymentDoc ? {
    tanggalBayar: pendingRegistrationPaymentDoc.tanggalBayar.toISOString(),
    nominal: pendingRegistrationPaymentDoc.nominal,
    createdAt: pendingRegistrationPaymentDoc.createdAt.toISOString(),
  } : null;

  const rejectedRegistrationPayment = rejectedRegistrationPaymentDoc ? {
    catatanAdmin: rejectedRegistrationPaymentDoc.catatanAdmin || "",
    tanggalBayar: rejectedRegistrationPaymentDoc.tanggalBayar.toISOString(),
  } : null;

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Hero Dinamis Mengikuti Tema Aktif ── */}
      <PageHero
        title="Keuangan & Pembayaran"
        subtitle={
          isRegistrationAccepted
            ? "Kelola histori pembayaran akademik Anda dan konfirmasi transaksi lanjutan."
            : "Langkah wajib pertama: Selesaikan pembayaran pendaftaran RPL & unggah 4 berkas legalitas untuk membuka seluruh akses akademik."
        }
        tone="primary"
        rightContent={
          <div style={{ minWidth: 260 }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.22)", borderRadius: 16, background: "rgba(255,255,255,0.12)", padding: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8, marginBottom: 6 }}>
                Status Pendaftaran
              </p>
              <p style={{ fontSize: 24, lineHeight: 1.15, fontWeight: 900 }}>
                {isRegistrationAccepted ? "✓ Terverifikasi" : prosesCount > 0 ? "⏳ Sedang Diproses" : "Belum Lunas"}
              </p>
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: isRegistrationAccepted ? "rgba(16, 185, 129, 0.25)" : "rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 800 }}>
                <span>Total Dana Diterima: Rp {totalDana.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        }
      />

      {/* ── 3 Kartu Metrik Status Transaksi ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { label: "Menunggu Validasi", value: prosesCount, color: "var(--md-warning)", bg: "var(--md-warning-container)", icon: "⏳" },
          { label: "Pembayaran Diterima", value: diterimaCount, color: "var(--md-success)", bg: "var(--md-success-container)", icon: "✅" },
          { label: "Pembayaran Ditolak", value: ditolakCount, color: "var(--md-error)", bg: "var(--md-error-container)", icon: "⚠️" },
        ].map((item) => (
          <div key={item.label} className="md-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <p style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                {item.label}
              </p>
              <p style={{ color: "var(--md-on-surface)", fontSize: 24, fontWeight: 900, margin: "4px 0 0" }}>
                {item.value}
              </p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Client Component dengan Logika Gated Onboarding & Form Khusus ── */}
      <KeuanganClient
        histori={histori}
        isRegistrationAccepted={isRegistrationAccepted}
        pendingRegistrationPayment={pendingRegistrationPayment}
        rejectedRegistrationPayment={rejectedRegistrationPayment}
        settings={settings}
      />
    </div>
  );
}
