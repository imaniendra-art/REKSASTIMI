"use server";

import { getSession } from "@/lib/session";
import { connectMongoDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/[^a-z0-9]/g, "_")      // replace non-alphanumeric with _
    .replace(/_+/g, "_")             // remove redundant underscores
    .replace(/^_|_$/g, "");          // trim leading/trailing underscores
}

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

    // Limit 15MB max (client compressor usually brings it down to ~300KB)
    if (fileBukti.size > 15 * 1024 * 1024) {
      return { success: false, error: "Ukuran file bukti pembayaran maksimal 15 MB." };
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
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

    // Determine clean student name slug (e.g. budi_santoso)
    const profile = await ApplicantProfile.findOne({ userId: session.id });
    const rawName = (profile as any)?.identity?.fullName || session.name || session.username || "mahasiswa";
    const slugName = sanitizeSlug(rawName) || "mahasiswa";

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
      "image/webp": "webp",
      "application/pdf": "pdf",
    };

    // 2. Save payment receipt file with standardized naming: pendaftaran_nama.ext
    const receiptExt = extByType[fileBukti.type] ?? "jpg";
    const buktiFilename = isPendaftaran
      ? `pendaftaran_${slugName}.${receiptExt}`
      : `transfer_${session.id.slice(-6)}_${Date.now()}.${receiptExt}`;
    const buktiPath = path.join(keuanganUploadDir, buktiFilename);
    const buktiBuffer = Buffer.from(await fileBukti.arrayBuffer());
    fs.writeFileSync(buktiPath, buktiBuffer);
    const buktiUrl = `/uploads/keuangan/${buktiFilename}`;

    // 3. Process the 4 mandatory legal documents if registration
    const docItems = [
      { key: "ktp", file: fileKtp },
      { key: "kk", file: fileKk },
      { key: "akta", file: fileAkta },
      { key: "ijazah", file: fileIjazah },
    ];

    const currentDocs: Array<{
      type: string;
      fileName: string;
      fileUrl: string;
      validationStatus: string;
      note?: string;
      uploadedAt: Date;
    }> = profile && profile.documents
      ? ((profile.documents as any[]).map((d) => ({
          type: d.type,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          validationStatus: d.validationStatus,
          note: d.note,
          uploadedAt: d.uploadedAt,
        })))
      : [];

    for (const item of docItems) {
      if (item.file && item.file.size > 0) {
        const docExt = extByType[item.file.type] ?? "jpg";
        // Standardized naming as requested: ktp_nama, kk_nama, akta_nama, ijazah_nama
        const docFilename = `${item.key}_${slugName}.${docExt}`;
        const docPath = path.join(studentUploadDir, docFilename);
        const docBuffer = Buffer.from(await item.file.arrayBuffer());
        // Safely write / overwrite
        fs.writeFileSync(docPath, docBuffer);
        const docUrl = `/uploads/${session.id}/${docFilename}`;

        const existingIdx = currentDocs.findIndex((d) => d.type === item.key);
        if (existingIdx > -1) {
          currentDocs[existingIdx] = {
            ...currentDocs[existingIdx],
            fileName: docFilename,
            fileUrl: docUrl,
            validationStatus: "menunggu",
            uploadedAt: new Date(),
          };
        } else {
          currentDocs.push({
            type: item.key,
            fileName: docFilename,
            fileUrl: docUrl,
            validationStatus: "menunggu",
            uploadedAt: new Date(),
          });
        }
      }
    }

    // 4. Create or update Payment document
    await Payment.create({
      userId: session.id,
      jenisPembayaran: jenis,
      tanggalBayar: new Date(tanggalBayar),
      nominal: nominalNumber,
      keterangan: keterangan || (isPendaftaran ? "Pembayaran Pendaftaran RPL STIMI YAPMI" : "-"),
      buktiBayar: buktiUrl,
      statusVerifikasi: "Proses",
    });

    // 5. Update ApplicantProfile documents & status
    if (profile) {
      profile.documents = currentDocs as any;
      profile.markModified("documents");
      if (isPendaftaran && (!profile.statusPembayaran || profile.statusPembayaran === "BELUM_BAYAR" || profile.statusPembayaran === "DITOLAK")) {
        profile.statusPembayaran = "PROSES";
        (profile as any).progress = {
          ...((profile as any).progress || {}),
          paymentStatus: "PROSES",
        };
      }
      await profile.save();
    } else {
      const activePeriod = await Period.findOne({ isActive: true }).lean();
      await ApplicantProfile.create({
        userId: session.id,
        periodId: activePeriod?._id,
        periodName: activePeriod?.namaPeriode || "2025/2026 Ganjil",
        program: "S1 Manajemen",
        concentration: "Manajemen",
        statusRpl: "PENDAFTARAN",
        statusPembayaran: "PROSES",
        identity: {
          fullName: session.name || session.username || "Mahasiswa RPL",
        },
        contact: {
          email: session.username?.includes("@") ? session.username : "",
        },
        documents: currentDocs,
        progress: {
          paymentStatus: "PROSES",
        },
      });
    }

    revalidatePath("/dashboard/mahasiswa/keuangan");
    revalidatePath("/dashboard/mahasiswa");
    revalidatePath("/dashboard/layout");

    return {
      success: true,
      data: {
        buktiUrl,
        buktiFilename,
      },
    };
  } catch (error: any) {
    console.error("Error submitPayment:", error);
    return { success: false, error: error.message || "Gagal memproses pembayaran dan berkas." };
  }
}
