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

    const jenis = (formData.get("jenis") as string) || "";
    const tanggalBayar = (formData.get("tanggal_bayar") as string) || "";
    const nominal = (formData.get("nominal") as string) || "";
    const keterangan = (formData.get("keterangan") as string) || "";
    const fileBukti = formData.get("bukti") as File | null;

    if (!jenis || !tanggalBayar || !nominal || !fileBukti || fileBukti.size === 0) {
      return { success: false, error: "Data pembayaran dan file bukti transfer wajib diisi." };
    }

    const nominalNumber = Number(nominal);
    if (!Number.isFinite(nominalNumber) || nominalNumber <= 0) {
      return { success: false, error: "Nominal pembayaran harus lebih dari 0." };
    }

    if (fileBukti.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran file bukti pembayaran maksimal 5 MB." };
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(fileBukti.type)) {
      return { success: false, error: "Format file bukti pembayaran tidak didukung. Gunakan JPG, PNG, atau PDF." };
    }

    const isPendaftaran = jenis.toLowerCase().includes("pendaftaran");
    const fileKtp = formData.get("file_ktp") as File | null;
    const fileKk = formData.get("file_kk") as File | null;
    const fileAkta = formData.get("file_akta") as File | null;
    const fileIjazah = formData.get("file_ijazah") as File | null;

    if (isPendaftaran) {
      if (!fileKtp || fileKtp.size === 0) {
        return { success: false, error: "Foto / Scan KTP Asli wajib diunggah untuk pendaftaran." };
      }
      if (!fileKk || fileKk.size === 0) {
        return { success: false, error: "Foto / Scan Kartu Keluarga (KK) wajib diunggah untuk pendaftaran." };
      }
      if (!fileAkta || fileAkta.size === 0) {
        return { success: false, error: "Foto / Scan Akta Kelahiran wajib diunggah untuk pendaftaran." };
      }
      if (!fileIjazah || fileIjazah.size === 0) {
        return { success: false, error: "Foto / Scan Ijazah SMA/Sederajat wajib diunggah untuk pendaftaran." };
      }
    }

    await connectMongoDB();

    // 1. Setup upload directories
    const keuanganUploadDir = path.join(process.cwd(), "public", "uploads", "keuangan");
    if (!fs.existsSync(keuanganUploadDir)) {
      fs.mkdirSync(keuanganUploadDir, { recursive: true });
    }

    const studentUploadDir = path.join(process.cwd(), "public", "uploads", session.id);
    if (!fs.existsSync(studentUploadDir)) {
      fs.mkdirSync(studentUploadDir, { recursive: true });
    }

    const extByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
    };

    // 2. Save payment receipt file
    const buktiExt = extByType[fileBukti.type] ?? "bin";
    const buktiFilename = `BAYAR_${session.id}_${Date.now()}.${buktiExt}`;
    const buktiFilePath = path.join(keuanganUploadDir, buktiFilename);
    const buktiBuffer = Buffer.from(await fileBukti.arrayBuffer());
    fs.writeFileSync(buktiFilePath, buktiBuffer);
    const buktiUrl = `/uploads/keuangan/${buktiFilename}`;

    // 3. Save mandatory student registration documents if provided
    const profile = await ApplicantProfile.findOne({ userId: session.id });
    const currentDocs: any[] = ((profile?.documents || []) as any[]).map((d) => ({
      type: d.type,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      validationStatus: d.validationStatus,
      note: d.note,
      uploadedAt: d.uploadedAt,
    }));

    const docItems = [
      { key: "ktp", file: fileKtp },
      { key: "kk", file: fileKk },
      { key: "akta", file: fileAkta },
      { key: "ijazah", file: fileIjazah },
    ];

    for (const item of docItems) {
      if (item.file && item.file.size > 0) {
        const docExt = extByType[item.file.type] ?? "jpg";
        const docFilename = `${item.key}_${session.id}_${Date.now()}.${docExt}`;
        const docPath = path.join(studentUploadDir, docFilename);
        const docBuffer = Buffer.from(await item.file.arrayBuffer());
        fs.writeFileSync(docPath, docBuffer);
        const docUrl = `/uploads/${session.id}/${docFilename}`;

        const existingIdx = currentDocs.findIndex((d) => d.type === item.key);
        if (existingIdx > -1) {
          currentDocs[existingIdx] = {
            ...currentDocs[existingIdx],
            fileName: item.file.name,
            fileUrl: docUrl,
            validationStatus: "menunggu",
            uploadedAt: new Date(),
          };
        } else {
          currentDocs.push({
            type: item.key,
            fileName: item.file.name,
            fileUrl: docUrl,
            validationStatus: "menunggu",
            uploadedAt: new Date(),
          });
        }
      }
    }

    // 4. Create Payment document
    await Payment.create({
      userId: session.id,
      jenisPembayaran: jenis,
      tanggalBayar: new Date(tanggalBayar),
      nominal: nominalNumber,
      keterangan: keterangan || "",
      buktiBayar: buktiUrl,
      statusVerifikasi: "Proses",
    });

    // 5. Update Applicant Profile
    if (profile) {
      profile.documents = currentDocs as any;
      profile.markModified("documents");

      const currentStatus = profile.progress?.paymentStatus || "BELUM_BAYAR";
      if (currentStatus === "BELUM_BAYAR" || currentStatus === "DITOLAK") {
        const prof = profile as any;
        if (!prof.progress) prof.progress = {};
        prof.progress.paymentStatus = "PROSES";
        profile.statusPembayaran = "PROSES";
        profile.statusRpl = "PEMBAYARAN";
      }

      await profile.save();
    }

    revalidatePath("/dashboard/mahasiswa/keuangan");
    revalidatePath("/dashboard/mahasiswa");
    revalidatePath("/dashboard/admin/mahasiswa");

    return { success: true };
  } catch (error: any) {
    console.error("submitPayment error:", error);
    return { success: false, error: error.message || "Gagal menyimpan konfirmasi pembayaran." };
  }
}
