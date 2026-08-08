import { PageHero } from "@/components/dashboard/UIComponents";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Payment } from "@/models/Payment";
import KeuanganClient from "./KeuanganClient";

export default async function MahasiswaKeuanganPage() {
  await connectMongoDB();
  const session = await getSession();

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

  const totalDana = histori.reduce((acc, curr) => {
    return curr.statusVerifikasi === "Diterima" ? acc + curr.nominal : acc;
  }, 0);

  const prosesCount = histori.filter((item) => item.statusVerifikasi === "Proses").length;
  const diterimaCount = histori.filter((item) => item.statusVerifikasi === "Diterima").length;
  const ditolakCount = histori.filter((item) => item.statusVerifikasi === "Ditolak").length;

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 40 }}>
      <PageHero
        badgeIcon="Rp"
        badgeText="Keuangan Mahasiswa"
        title="Keuangan & Pembayaran"
        subtitle="Konfirmasi pembayaran dan pantau histori transaksi Anda."
        tone="danger"
        rightContent={
          <div style={{ minWidth: 260 }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.22)", borderRadius: 16, background: "rgba(255,255,255,0.12)", padding: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.78, marginBottom: 6 }}>
                Total Dana Terverifikasi
              </p>
              <p style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 800 }}>
                Rp {totalDana.toLocaleString("id-ID")}
              </p>
              <p style={{ marginTop: 10, fontSize: 11, fontWeight: 700, opacity: 0.78 }}>
                Akun: {session.role.toUpperCase()}
              </p>
            </div>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Menunggu Validasi", value: prosesCount, color: "var(--md-warning)", bg: "var(--md-warning-container)" },
          { label: "Pembayaran Diterima", value: diterimaCount, color: "var(--md-success)", bg: "var(--md-success-container)" },
          { label: "Pembayaran Ditolak", value: ditolakCount, color: "var(--md-error)", bg: "var(--md-error-container)" },
        ].map((item) => (
          <div key={item.label} className="md-card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <p style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
              <p style={{ color: "var(--md-on-surface)", fontSize: 26, fontWeight: 800, marginTop: 4 }}>{item.value}</p>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <KeuanganClient histori={histori} />
    </div>
  );
}
