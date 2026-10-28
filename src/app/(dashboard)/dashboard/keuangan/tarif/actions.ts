"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { saveFinanceSettings, type FinanceSettingsData } from "@/lib/finance-settings";

const allowedRoles = new Set(["admin", "keuangan"]);

export async function updateFinanceSettingsAction(formData: FormData) {
  const session = await getSession();
  if (!session || !allowedRoles.has(session.role)) {
    throw new Error("Akses ditolak. Hanya admin keuangan yang berwenang.");
  }

  const registrationFee = Number(formData.get("registrationFee") ?? 250000);
  const assessmentFee = Number(formData.get("assessmentFee") ?? 0);
  const bankName = String(formData.get("bankName") ?? "").trim() || "Bank Rakyat Indonesia (BRI)";
  const accountNumber = String(formData.get("accountNumber") ?? "").trim() || "3419-0106-7835-533";
  const accountHolder = String(formData.get("accountHolder") ?? "").trim() || "RPL STIMI YAPMI Makassar";
  const treasurerName = String(formData.get("treasurerName") ?? "").trim() || "Riswan, S.E. (Bendahara RPL)";
  const institutionName = String(formData.get("institutionName") ?? "").trim() || "STIMI YAPMI Makassar";

  await saveFinanceSettings({
    registrationFee,
    assessmentFee,
    bankName,
    accountNumber,
    accountHolder,
    treasurerName,
    institutionName,
  });

  revalidatePath("/dashboard/keuangan");
  revalidatePath("/dashboard/keuangan/tarif");
  revalidatePath("/dashboard/keuangan/kuitansi");
  revalidatePath("/dashboard/keuangan/laporan");
  revalidatePath("/dashboard/mahasiswa/keuangan");

  return { success: true, message: "Pengaturan tarif dan rekening berhasil disimpan." };
}
