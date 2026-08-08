import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

export type FinancePaymentRow = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  registrationNumber: string;
  periodName: string;
  jenisPembayaran: string;
  tanggalBayar: string;
  nominal: number;
  keterangan: string;
  buktiBayar: string;
  statusVerifikasi: "Proses" | "Diterima" | "Ditolak";
  catatanAdmin: string;
  createdAt: string;
};

export async function getFinancePayments(): Promise<FinancePaymentRow[]> {
  await connectMongoDB();

  const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
  const userIds = payments.map((payment) => String(payment.userId));

  const [users, profiles] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("name email").lean(),
    ApplicantProfile.find({ userId: { $in: userIds } })
      .select("userId registrationNumber noPendaftar periodName periode identity.fullName nama contact.email email")
      .lean()
  ]);

  const usersById = new Map(users.map((user) => [String(user._id), user]));
  const profilesByUserId = new Map(profiles.map((profile) => [String(profile.userId), profile]));

  return payments.map((payment) => {
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
      createdAt: payment.createdAt.toISOString()
    };
  });
}

export function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
