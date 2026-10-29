"use server";

import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { connectMongoDB } from "@/lib/mongodb";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function saveBiodata(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectMongoDB();

    let profile = await ApplicantProfile.findOne({ userId: session.id });
    if (!profile) {
      const activePeriod = await Period.findOne({ isActive: true }).lean();
      profile = await ApplicantProfile.create({
        userId: session.id,
        periodId: activePeriod?._id,
        periodName: activePeriod?.namaPeriode || "2025/2026 Ganjil",
        statusRpl: "LENGKAPI_CV",
        statusPembayaran: "DITERIMA",
        identity: { fullName: session.name || "Mahasiswa RPL" },
        contact: { email: session.username?.includes("@") ? session.username : "" },
      });
    }

    // Parse Text Fields
    const fullName = (formData.get("nama_lengkap") as string)?.trim() || "";
    const nameOnCertificate = (formData.get("nama_ijazah") as string)?.trim() || fullName;
    const placeOfBirth = (formData.get("tempat_lahir") as string)?.trim() || "";
    const dateOfBirth = (formData.get("tanggal_lahir") as string)?.trim() || "";
    const gender = (formData.get("jenis_kelamin") as "" | "L" | "P") || "";
    const religion = (formData.get("agama") as string)?.trim() || "";
    const motherName = (formData.get("nama_ibu") as string)?.trim() || "";
    
    const citizenship = (formData.get("kewarganegaraan") as string)?.trim() || "Indonesia";
    const nik = (formData.get("nik") as string)?.trim() || "";
    const nisn = (formData.get("nisn") as string)?.trim() || "";
    const address = (formData.get("alamat") as string)?.trim() || "";
    const village = (formData.get("kelurahan") as string)?.trim() || "";
    const district = (formData.get("kecamatan") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const phone = (formData.get("no_hp") as string)?.trim() || "";

    // Update Identity & Contact
    profile.identity = {
      ...profile.identity,
      fullName: fullName || profile.identity?.fullName,
      nameOnCertificate: nameOnCertificate || profile.identity?.nameOnCertificate,
      placeOfBirth,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : profile.identity?.dateOfBirth,
      gender,
      religion,
      motherName,
      citizenship,
      nik,
      nisn
    };

    profile.contact = {
      ...profile.contact,
      address,
      village,
      district,
      email,
      phone
    };

    // Handle File Uploads (Local for now)
    const uploadDir = path.join(process.cwd(), "public", "uploads", session.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const fileFields = [
      { key: "file_kk", type: "kk" },
      { key: "file_ktp", type: "ktp" },
      { key: "file_akta", type: "akta" },
      { key: "file_ijazah", type: "ijazah" },
      { key: "file_dukung", type: "pendukung" },
      { key: "file_ttd", type: "ttd" }
    ];

    const currentDocs: any[] = ((profile.documents || []) as any[]).map((doc) => ({
      type: doc.type,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      validationStatus: doc.validationStatus,
      note: doc.note,
      uploadedAt: doc.uploadedAt,
    }));

    for (const field of fileFields) {
      const file = formData.get(field.key) as File | null;
      
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Sanitize filename
        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${field.type}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.writeFile(filePath, buffer);
        
        const fileUrl = `/uploads/${session.id}/${fileName}`;
        
        // Check if doc type already exists
        const docIndex = currentDocs.findIndex((d: any) => d.type === field.type);
        if (docIndex > -1) {
          currentDocs[docIndex] = {
            ...currentDocs[docIndex],
            fileName: file.name,
            fileUrl,
            uploadedAt: new Date()
          };
        } else {
          currentDocs.push({
            type: field.type,
            fileName: file.name,
            fileUrl,
            validationStatus: "menunggu",
            uploadedAt: new Date()
          });
        }
      }
    }

    profile.documents = currentDocs as any;
    profile.markModified("documents");
    await profile.save();

    revalidatePath("/dashboard/mahasiswa/biodata");
    revalidatePath("/dashboard/mahasiswa");

    return { success: true };
  } catch (error: any) {
    console.error("saveBiodata Error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem saat menyimpan biodata." };
  }
}
