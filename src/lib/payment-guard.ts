import { connectMongoDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { redirect } from "next/navigation";

export async function isRegistrationPaymentAccepted(userId: string): Promise<boolean> {
  await connectMongoDB();
  const acceptedPayment = await Payment.exists({
    userId,
    statusVerifikasi: "Diterima",
    jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
  });
  return Boolean(acceptedPayment);
}

export async function ensureRegistrationPayment(userId: string) {
  const isAccepted = await isRegistrationPaymentAccepted(userId);
  if (!isAccepted) {
    redirect("/dashboard/mahasiswa/keuangan?notice=pendaftaran_wajib");
  }
}
