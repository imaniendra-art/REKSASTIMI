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
        identity: { fullName: (session.name || "MAHASISWA RPL").toUpperCase() },
        contact: { email: (session.username?.includes("@") ? session.username : "MAHASISWA@STIMI.AC.ID").toUpperCase() },
      });
    }

    // Parse Text Fields with Automatic Uppercase
    const fullName = ((formData.get("nama_lengkap") as string)?.trim() || profile.identity?.fullName || "MAHASISWA RPL").toUpperCase();
    const nameOnCertificate = ((formData.get("nama_ijazah") as string)?.trim() || fullName).toUpperCase();
    const placeOfBirth = ((formData.get("tempat_lahir") as string)?.trim() || profile.identity?.placeOfBirth || "MAKASSAR").toUpperCase();
    const dateOfBirth = (formData.get("tanggal_lahir") as string)?.trim() || (profile.identity?.dateOfBirth ? new Date(profile.identity.dateOfBirth).toISOString().split("T")[0] : "1998-05-15");
    const rawGender = ((formData.get("jenis_kelamin") as string)?.trim() || profile.identity?.gender || "L").toUpperCase();
    const gender = (rawGender === "P" ? "P" : "L") as "L" | "P";
    const religion = ((formData.get("agama") as string)?.trim() || profile.identity?.religion || "ISLAM").toUpperCase();
    const motherName = ((formData.get("nama_ibu") as string)?.trim() || profile.identity?.motherName || "IBU KANDUNG").toUpperCase();
    
    const rawCitizenship = ((formData.get("kewarganegaraan") as string)?.trim() || profile.identity?.citizenship || "WNI").toUpperCase();
    const citizenship = rawCitizenship === "WNA" ? "WNA" : "WNI";
    const nik = (formData.get("nik") as string)?.trim() || profile.identity?.nik || "7371141901920001";
    const nisn = (formData.get("nisn") as string)?.trim() || profile.identity?.nisn || "0008999121";
    const address = ((formData.get("alamat") as string)?.trim() || profile.contact?.address || "JL. PERINTIS KEMERDEKAAN KM. 10").toUpperCase();
    const village = ((formData.get("kelurahan") as string)?.trim() || profile.contact?.village || "TAMALANREA").toUpperCase();
    const district = ((formData.get("kecamatan") as string)?.trim() || profile.contact?.district || "TAMALANREA").toUpperCase();
    const email = ((formData.get("email") as string)?.trim() || profile.contact?.email || "MAHASISWA@STIMI.AC.ID").toUpperCase();
    const phone = (formData.get("no_hp") as string)?.trim() || profile.contact?.phone || "081234567890";

    // Update Identity & Contact
    profile.identity = {
      ...profile.identity,
      fullName,
      nameOnCertificate,
      placeOfBirth,
      dateOfBirth: new Date(dateOfBirth),
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
    const updatePayload: any = {
      identity: profile.identity,
      contact: profile.contact,
      documents: currentDocs,
    };
    await ApplicantProfile.updateOne(
      { _id: profile._id },
      { $set: updatePayload }
    );

    revalidatePath("/dashboard/mahasiswa/biodata");
    revalidatePath("/dashboard/mahasiswa");

    return {
      success: true,
      data: {
        identity: profile.identity,
        contact: profile.contact
      }
    };
  } catch (error: any) {
    console.error("saveBiodata Error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem saat menyimpan biodata." };
  }
}
