"use server";

import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
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

    const profile = await ApplicantProfile.findOne({ userId: session.id });
    if (!profile) {
      return { success: false, error: "Profil tidak ditemukan" };
    }

    // Parse Text Fields
    const fullName = formData.get("nama_lengkap") as string;
    const nameOnCertificate = formData.get("nama_ijazah") as string;
    const placeOfBirth = formData.get("tempat_lahir") as string;
    const dateOfBirth = formData.get("tanggal_lahir") as string;
    const gender = formData.get("jenis_kelamin") as "" | "L" | "P";
    const religion = formData.get("agama") as string;
    const motherName = formData.get("nama_ibu") as string;
    
    const citizenship = formData.get("kewarganegaraan") as string;
    const nik = formData.get("nik") as string;
    const nisn = formData.get("nisn") as string;
    const address = formData.get("alamat") as string;
    const village = formData.get("kelurahan") as string;
    const district = formData.get("kecamatan") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("no_hp") as string;

    // Update Identity & Contact
    profile.identity = {
      ...profile.identity,
      fullName,
      nameOnCertificate: nameOnCertificate || fullName,
      placeOfBirth,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
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

    // Update Status if it's still PENDAFTARAN
    // Note: Actually if CV is also required, we might not change status to PEMBAYARAN until CV is done.
    // In SIRESTI, usually Biodata is first, then CV. 
    // We will leave status update to CV submission, or if this is the only step, update it here.
    // Since the step is "LENGKAPI CV" (includes both), we will just update it when CV is submitted.

    // Handle File Uploads (Local for now)
    const uploadDir = path.join(process.cwd(), "public", "uploads", session.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const fileFields = [
      { key: "file_kk", type: "kk" },
      { key: "file_ktp", type: "ktp" },
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
      console.log(`Field ${field.key} file:`, file?.name, "size:", file?.size, "type:", typeof file);
      
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Sanitize filename
        const ext = path.extname(file.name);
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
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}
