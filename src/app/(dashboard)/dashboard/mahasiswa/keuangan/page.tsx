import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Payment } from "@/models/Payment";
import { getFinanceSettings } from "@/lib/finance-settings";
import KeuanganClient from "./KeuanganClient";

export const metadata = {
  title: "Keuangan Mahasiswa - REKSA STIMI",
};

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

  const statusRegistrasiValue = isRegistrationAccepted
    ? "Terverifikasi"
    : prosesCount > 0
    ? "Diproses"
    : "Belum Lunas";

  const statusRegistrasiBadge = isRegistrationAccepted
    ? "Akses Aktif"
    : prosesCount > 0
    ? "Menunggu Validasi"
    : "Wajib Registrasi";

  const statusRegistrasiColor = isRegistrationAccepted
    ? "var(--md-success)"
    : prosesCount > 0
    ? "var(--md-warning)"
    : "var(--md-primary)";

  const statusRegistrasiBg = isRegistrationAccepted
    ? "var(--md-success-container)"
    : prosesCount > 0
    ? "var(--md-warning-container)"
    : "var(--md-primary-container)";

  const statusRegistrasiIcon = isRegistrationAccepted ? "✓" : prosesCount > 0 ? "⏳" : "💳";

  const cards = [
    {
      label: "Status Pendaftaran",
      value: statusRegistrasiValue,
      badge: statusRegistrasiBadge,
      color: statusRegistrasiColor,
      bg: statusRegistrasiBg,
      icon: statusRegistrasiIcon,
    },
    {
      label: "Menunggu Validasi",
      value: `${prosesCount} Transaksi`,
      badge: prosesCount > 0 ? "Dalam Antrean" : "Antrean Bersih",
      color: "var(--md-warning)",
      bg: "var(--md-warning-container)",
      icon: "⏳",
    },
    {
      label: "Pembayaran Diterima",
      value: `${diterimaCount} Transaksi`,
      badge: totalDana > 0 ? `Total: Rp ${totalDana.toLocaleString("id-ID")}` : "Belum Ada",
      color: "var(--md-success)",
      bg: "var(--md-success-container)",
      icon: "✓",
    },
    {
      label: "Pembayaran Ditolak",
      value: `${ditolakCount} Transaksi`,
      badge: ditolakCount > 0 ? "Perlu Revisi" : "Tidak Ada",
      color: "var(--md-error)",
      bg: "var(--md-error-container)",
      icon: "⚠️",
    },
  ];

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── 4 Kartu Status & Metrik Keuangan ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((item) => (
          <div
            key={item.label}
            className="md-card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: "var(--md-surface-1)",
              borderRadius: 16,
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  color: "var(--md-on-surface-variant)",
                  fontSize: 10.5,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  color: "var(--md-on-surface)",
                  fontSize: 17,
                  fontWeight: 900,
                  margin: "3px 0 2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: item.color,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {item.badge}
              </span>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: item.bg,
                color: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Client Component dengan Form & Transaksi ── */}
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
