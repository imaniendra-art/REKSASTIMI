"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { Period } from "@/models/Period";
import { formatRplRegistrationNumber, generateRplIdentityNumber } from "@/lib/rpl-registration";

const allowedRoles = new Set(["admin", "keuangan"]);
const registrationFeeLabel = "biaya pendaftaran rpl";

function isRegistrationFeePayment(jenisPembayaran: string) {
  return jenisPembayaran.trim().toLowerCase() === registrationFeeLabel;
}

async function requireFinanceUser() {
  const session = await getSession();
  if (!session || !allowedRoles.has(session.role)) {
    redirect("/dashboard");
  }
  return session;
}

export async function verifyPayment(formData: FormData) {
  await requireFinanceUser();

  const paymentId = String(formData.get("paymentId") ?? "");
  const status = String(formData.get("status") ?? "");
  const catatanAdmin = String(formData.get("catatanAdmin") ?? "").trim();

  if (!paymentId || !["Diterima", "Ditolak"].includes(status)) {
    return;
  }

  await connectMongoDB();

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return;
  }

  payment.statusVerifikasi = status as "Diterima" | "Ditolak";
  payment.catatanAdmin = status === "Ditolak" ? catatanAdmin || "Bukti pembayaran perlu diperbaiki." : "";
  await payment.save();

  const paymentStatus = status === "Diterima" ? "DITERIMA" : "DITOLAK";
  const profileUpdate: Record<string, string> = {
    "progress.paymentStatus": paymentStatus,
    statusPembayaran: paymentStatus
  };

  if (status === "Diterima" && isRegistrationFeePayment(payment.jenisPembayaran)) {
    const profile = await ApplicantProfile.findOne({ userId: payment.userId })
      .select("statusRpl registrationNumber nim periodId")
      .lean();
    const currentStatus = profile?.statusRpl || "PENDAFTARAN";
    const canAdvanceToCv = ["PENDAFTARAN", "PEMBAYARAN"].includes(currentStatus);

    if (canAdvanceToCv) {
      profileUpdate.statusRpl = "LENGKAPI_CV";
    }

    if (!profile?.nim) {
      const activePeriod = profile?.periodId
        ? await Period.findById(profile.periodId).lean()
        : await Period.findOne({ isActive: true }).lean();
      const nim = await generateRplIdentityNumber(activePeriod);

      profileUpdate.nim = nim;
      profileUpdate.registrationNumber = formatRplRegistrationNumber(nim);
    } else if (!profile.registrationNumber || !profile.registrationNumber.startsWith("RPL-")) {
      profileUpdate.registrationNumber = formatRplRegistrationNumber(profile.nim);
    }
  }

  await ApplicantProfile.updateOne({ userId: payment.userId }, { $set: profileUpdate }, { upsert: true });

  revalidatePath("/dashboard/keuangan");
  revalidatePath("/dashboard/keuangan/validasi");
  revalidatePath("/dashboard/keuangan/rekap");
  revalidatePath("/dashboard/mahasiswa");
  revalidatePath("/dashboard/mahasiswa/keuangan");
}
