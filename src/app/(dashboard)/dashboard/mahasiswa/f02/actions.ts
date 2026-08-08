"use server";

import { connectMongoDB } from "@/lib/mongodb";
import { F02Pengajuan } from "@/models/F02Pengajuan";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveF02(data: { matkulId: string; jenisPengajuan: string }[], concentration?: string) {
  const session = await getSession();
  if (!session || session.role !== "mahasiswa") {
    throw new Error("Unauthorized");
  }

  await connectMongoDB();

  try {
    // Clear existing F02 choices for this user
    await F02Pengajuan.deleteMany({ userId: session.id });

    // Insert new choices
    if (data && data.length > 0) {
      const docsToInsert = data.map((item) => ({
        userId: session.id,
        matkulId: item.matkulId,
        jenisPengajuan: item.jenisPengajuan,
      }));
      await F02Pengajuan.insertMany(docsToInsert);
    }

    // Check existing profile to not downgrade status
    const profile = await ApplicantProfile.findOne({ userId: session.id }).lean();
    
    const updateSet: any = { concentration: concentration?.trim() || "-" };
    
    if (profile) {
      const currentStatus = profile.statusRpl || "PENDAFTARAN";
      // Advance to ASESMEN_KOMPETENSI if they are currently on ASESMEN_F02
      if (currentStatus === "ASESMEN_F02" || currentStatus === "PENDAFTARAN" || currentStatus === "PEMBAYARAN") {
        updateSet.statusRpl = "ASESMEN_KOMPETENSI";
        updateSet["progress.f02Status"] = "SELESAI";
      }
    }

    await ApplicantProfile.updateOne(
      { userId: session.id },
      { $set: updateSet },
      { upsert: false }
    );

    revalidatePath("/dashboard/mahasiswa/f02");
    return { success: true, message: "Berhasil menyimpan pengajuan F02!" };
  } catch (error: any) {
    console.error("F02 Save Error:", error);
    return { success: false, message: error.message || "Gagal menyimpan pengajuan F02." };
  }
}
