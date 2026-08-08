"use server";

import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export async function submitPayment(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "mahasiswa") {
      return { success: false, error: "Unauthorized" };
    }

    const jenis = formData.get("jenis") as string;
    const tanggalBayar = formData.get("tanggal_bayar") as string;
    const nominal = formData.get("nominal") as string;
    const keterangan = formData.get("keterangan") as string;
    const file = formData.get("bukti") as File;

    if (!jenis || !tanggalBayar || !nominal || !file || file.size === 0) {
      return { success: false, error: "Data tidak lengkap" };
    }

    const nominalNumber = Number(nominal);
    if (!Number.isFinite(nominalNumber) || nominalNumber <= 0) {
      return { success: false, error: "Nominal pembayaran harus lebih dari 0." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran bukti pembayaran maksimal 5 MB." };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, atau PDF." };
    }

    await connectMongoDB();

    // Setup upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "keuangan");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const extByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf"
    };
    const ext = extByType[file.type] ?? "bin";
    const filename = `BAYAR_${session.id}_${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const buktiUrl = `/uploads/keuangan/${filename}`;

    // Insert Payment
    await Payment.create({
      userId: session.id,
      jenisPembayaran: jenis,
      tanggalBayar: new Date(tanggalBayar),
      nominal: nominalNumber,
      keterangan: keterangan || "",
      buktiBayar: buktiUrl,
      statusVerifikasi: "Proses"
    });

    // Update Applicant Profile status
    const profile = await ApplicantProfile.findOne({ userId: session.id });
    if (profile) {
      const currentStatus = profile.progress?.paymentStatus || "BELUM_BAYAR";
      if (currentStatus === "BELUM_BAYAR" || currentStatus === "DITOLAK") {
        await ApplicantProfile.updateOne(
          { userId: session.id },
          { 
            $set: { 
              "progress.paymentStatus": "PROSES",
              statusPembayaran: "PROSES"
            } 
          }
        );
      }
    }

    revalidatePath("/dashboard/mahasiswa/keuangan");
    revalidatePath("/dashboard/mahasiswa");
    
    return { success: true };
  } catch (error: any) {
    console.error("submitPayment error:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menyimpan pembayaran." };
  }
}
