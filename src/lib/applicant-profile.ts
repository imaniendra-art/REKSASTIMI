import { connectMongoDB } from "@/lib/mongodb";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Payment } from "@/models/Payment";
import { Period } from "@/models/Period";
import { formatRplRegistrationNumber, generateRplIdentityNumber } from "@/lib/rpl-registration";
import type { SessionUser } from "@/lib/session";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export async function getOrCreateApplicantProfile(session: SessionUser) {
  await connectMongoDB();

  // 1. Check verified registration payment (support both string and ObjectId)
  const isObjectId = mongoose.Types.ObjectId.isValid(session.id);
  const userIdFilter = isObjectId
    ? { $or: [{ userId: session.id }, { userId: new mongoose.Types.ObjectId(session.id) }] }
    : { userId: session.id };

  const acceptedPayment = await Payment.exists({
    ...userIdFilter,
    statusVerifikasi: "Diterima",
    jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
  });
  const hasAcceptedPayment = Boolean(acceptedPayment);

  const pendingPayment = !hasAcceptedPayment
    ? await Payment.exists({
        ...userIdFilter,
        statusVerifikasi: "Proses",
        jenisPembayaran: /^Biaya Pendaftaran RPL$/i,
      })
    : null;
  const hasPendingPayment = Boolean(pendingPayment);

  // Helper to discover documents uploaded to public/uploads/[userId]
  const scanDiskDocs = () => {
    const studentUploadDir = path.join(process.cwd(), "public", "uploads", session.id);
    const diskDocs: Array<{
      type: string;
      fileName: string;
      fileUrl: string;
      validationStatus: string;
      note: string;
      uploadedAt: Date;
    }> = [];

    if (fs.existsSync(studentUploadDir)) {
      try {
        const files = fs.readdirSync(studentUploadDir);
        for (const file of files) {
          let docType = "";
          const lower = file.toLowerCase();
          if (lower.startsWith("ktp")) docType = "ktp";
          else if (lower.startsWith("kk")) docType = "kk";
          else if (lower.startsWith("akta")) docType = "akta";
          else if (lower.startsWith("ijazah")) docType = "ijazah";
          else if (lower.startsWith("pendukung") || lower.startsWith("dukung")) docType = "pendukung";
          else if (lower.startsWith("ttd")) docType = "ttd";

          if (docType) {
            diskDocs.push({
              type: docType,
              fileName: file,
              fileUrl: `/uploads/${session.id}/${file}`,
              validationStatus: hasAcceptedPayment ? "valid" : "menunggu",
              note: "",
              uploadedAt: new Date(),
            });
          }
        }
      } catch (err) {
        console.error("Error reading studentUploadDir:", err);
      }
    }
    return diskDocs;
  };

  // 2. Find or create ApplicantProfile
  let profile = await ApplicantProfile.findOne({
    $or: [
      { userId: session.id },
      ...(isObjectId ? [{ userId: new mongoose.Types.ObjectId(session.id) }] : [])
    ]
  });

  if (!profile) {
    const activePeriod = await Period.findOne({ isActive: true }).lean();
    let nim: string | undefined = undefined;
    let registrationNumber: string | undefined = undefined;

    if (hasAcceptedPayment) {
      nim = await generateRplIdentityNumber(activePeriod);
      registrationNumber = formatRplRegistrationNumber(nim);
    }

    const diskDocs = scanDiskDocs();

    profile = await ApplicantProfile.create({
      userId: session.id,
      periodId: activePeriod?._id,
      periodName: activePeriod?.namaPeriode || "2025/2026 Ganjil",
      program: "S1 Manajemen",
      concentration: "Manajemen",
      statusRpl: hasAcceptedPayment ? "LENGKAPI_CV" : "PENDAFTARAN",
      statusPembayaran: hasAcceptedPayment ? "DITERIMA" : hasPendingPayment ? "PROSES" : "BELUM_BAYAR",
      nim,
      registrationNumber,
      identity: {
        fullName: session.name || "Mahasiswa RPL",
      },
      contact: {
        email: session.username?.includes("@") ? session.username : "",
      },
      documents: diskDocs,
    });
  } else {
    let shouldUpdate = false;

    // Check if NIM or registrationNumber needs generation
    if (hasAcceptedPayment && (!profile.nim || !profile.registrationNumber)) {
      const activePeriod = profile.periodId
        ? await Period.findById(profile.periodId).lean()
        : await Period.findOne({ isActive: true }).lean();
      const nim = await generateRplIdentityNumber(activePeriod);
      profile.nim = nim;
      profile.registrationNumber = formatRplRegistrationNumber(nim);
      shouldUpdate = true;
    }

    // Synchronize payment status
    if (hasAcceptedPayment) {
      if (profile.statusPembayaran !== "DITERIMA") {
        profile.statusPembayaran = "DITERIMA";
        shouldUpdate = true;
      }
      if (profile.statusRpl === "PENDAFTARAN" || profile.statusRpl === "PEMBAYARAN") {
        profile.statusRpl = "LENGKAPI_CV";
        shouldUpdate = true;
      }
    }

    // Merge disk docs into profile documents if missing
    const diskDocs = scanDiskDocs();
    const currentDocs = ((profile.documents || []) as any[]).map((d) => ({
      type: d.type,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      validationStatus: d.validationStatus,
      note: d.note || "",
      uploadedAt: d.uploadedAt,
    }));

    for (const diskDoc of diskDocs) {
      const existingIdx = currentDocs.findIndex((d) => d.type === diskDoc.type);
      if (existingIdx === -1) {
        currentDocs.push(diskDoc);
        shouldUpdate = true;
      } else if (!currentDocs[existingIdx].fileUrl) {
        currentDocs[existingIdx].fileUrl = diskDoc.fileUrl;
        currentDocs[existingIdx].fileName = diskDoc.fileName;
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      profile.documents = currentDocs as any;
      const updatePayload: any = {
        documents: currentDocs,
      };
      if (profile.nim) updatePayload.nim = profile.nim;
      if (profile.registrationNumber) updatePayload.registrationNumber = profile.registrationNumber;
      if (profile.statusPembayaran) updatePayload.statusPembayaran = profile.statusPembayaran;
      if (profile.statusRpl) updatePayload.statusRpl = profile.statusRpl;

      try {
        await ApplicantProfile.updateOne(
          { _id: profile._id },
          { $set: updatePayload }
        );
      } catch (err) {
        console.warn("Non-fatal profile sync update warning:", err);
      }
    }
  }

  const plainProfile = profile.toObject ? profile.toObject() : profile;

  return {
    profile: plainProfile,
    hasAcceptedPayment,
    hasPendingPayment,
  };
}
