import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import type { FinanceAnalytics, FinancePaymentRow } from "./types";

export * from "./types";

export async function getFinanceDashboardData(): Promise<{
  payments: FinancePaymentRow[];
  analytics: FinanceAnalytics;
}> {
  await connectMongoDB();

  const [paymentsRaw, profiles, activePeriod] = await Promise.all([
    Payment.find({}).sort({ createdAt: -1 }).lean(),
    ApplicantProfile.find({})
      .select("userId registrationNumber noPendaftar periodName periode identity.fullName nama contact.email email statusPembayaran progress.paymentStatus")
      .lean(),
    Period.findOne({ isActive: true }).lean(),
  ]);

  const userIds = paymentsRaw.map((payment) => String(payment.userId));
  const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();

  const usersById = new Map(users.map((user) => [String(user._id), user]));
  const profilesByUserId = new Map(profiles.map((profile) => [String(profile.userId), profile]));

  const payments: FinancePaymentRow[] = paymentsRaw.map((payment) => {
    const userId = String(payment.userId);
    const user = usersById.get(userId);
    const profile = profilesByUserId.get(userId);

    return {
      id: String(payment._id),
      userId,
      studentName: profile?.identity?.fullName || profile?.nama || user?.name || "Mahasiswa",
      studentEmail: profile?.contact?.email || profile?.email || user?.email || "-",
      registrationNumber: profile?.registrationNumber || profile?.noPendaftar || "-",
      periodName: profile?.periodName || profile?.periode || "-",
      jenisPembayaran: payment.jenisPembayaran,
      tanggalBayar: payment.tanggalBayar.toISOString(),
      nominal: payment.nominal,
      keterangan: payment.keterangan || "",
      buktiBayar: payment.buktiBayar,
      statusVerifikasi: payment.statusVerifikasi,
      catatanAdmin: payment.catatanAdmin || "",
      createdAt: payment.createdAt.toISOString(),
    };
  });

  // Calculate Metrics
  const acceptedPayments = payments.filter((p) => p.statusVerifikasi === "Diterima");
  const pendingPayments = payments.filter((p) => p.statusVerifikasi === "Proses");
  const rejectedPayments = payments.filter((p) => p.statusVerifikasi === "Ditolak");

  const totalDanaMasuk = acceptedPayments.reduce((sum, p) => sum + p.nominal, 0);

  let totalPendaftaranNominal = 0;
  let totalPendaftaranCount = 0;
  let totalAsesmenNominal = 0;
  let totalAsesmenCount = 0;
  let totalLainnyaNominal = 0;
  let totalLainnyaCount = 0;

  for (const p of acceptedPayments) {
    const jenis = p.jenisPembayaran.toLowerCase();
    if (jenis.includes("pendaftaran")) {
      totalPendaftaranNominal += p.nominal;
      totalPendaftaranCount += 1;
    } else if (jenis.includes("asesmen")) {
      totalAsesmenNominal += p.nominal;
      totalAsesmenCount += 1;
    } else {
      totalLainnyaNominal += p.nominal;
      totalLainnyaCount += 1;
    }
  }

  // Pendaftar RPL Stats
  const totalPendaftar = profiles.length;
  let pendaftarLunasCount = 0;
  let pendaftarBelumLunasCount = 0;

  for (const prof of profiles) {
    const status = prof.statusPembayaran || (prof as any).progress?.paymentStatus;
    if (status === "DITERIMA") {
      pendaftarLunasCount += 1;
    } else {
      pendaftarBelumLunasCount += 1;
    }
  }

  // Monthly Trends (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const now = new Date();
  const monthlyTrends: FinanceAnalytics["monthlyTrends"] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
    const label = `${monthNames[m]} ${y}`;

    let monthTotal = 0;
    let monthCount = 0;

    for (const p of acceptedPayments) {
      const pDate = new Date(p.tanggalBayar);
      if (pDate.getFullYear() === y && pDate.getMonth() === m) {
        monthTotal += p.nominal;
        monthCount += 1;
      }
    }

    monthlyTrends.push({
      monthKey,
      label,
      total: monthTotal,
      count: monthCount,
    });
  }

  return {
    payments,
    analytics: {
      totalDanaMasuk,
      totalPendaftaranNominal,
      totalPendaftaranCount,
      totalAsesmenNominal,
      totalAsesmenCount,
      totalLainnyaNominal,
      totalLainnyaCount,
      totalPendingCount: pendingPayments.length,
      totalAcceptedCount: acceptedPayments.length,
      totalRejectedCount: rejectedPayments.length,
      totalPendaftar,
      pendaftarLunasCount,
      pendaftarBelumLunasCount,
      namaPeriodeAktif: activePeriod?.namaPeriode || "Periode Aktif",
      monthlyTrends,
    },
  };
}
