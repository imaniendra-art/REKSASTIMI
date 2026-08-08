"use server";

import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { connectMongoDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function saveCVData(cvData: any) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectMongoDB();

    const profile = await ApplicantProfile.findOne({ userId: session.id }).select("_id statusRpl");
    if (!profile) {
      return { success: false, error: "Profil tidak ditemukan" };
    }

    const nextCV = {
      currentWork: cvData.currentWork || {},
      formalEducation: cvData.formalEducation || [],
      nonFormalEducation: cvData.trainings || cvData.nonFormalEducation || [],
      trainings: cvData.trainings || cvData.nonFormalEducation || [],
      workExperience: cvData.workExperience || [],
      conferences: cvData.conferences || [],
      achievements: cvData.achievements || [],
      organizations: cvData.organizations || []
    };

    const nextWork = {
      maritalStatus: cvData.currentWork?.maritalStatus || "",
      employmentStatus: cvData.currentWork?.employmentStatus || "",
      institution: cvData.currentWork?.institution || "",
      position: cvData.currentWork?.position || "",
      officeAddress: cvData.currentWork?.officeAddress || "",
      officePhone: cvData.currentWork?.officePhone || "",
      officeEmail: cvData.currentWork?.officeEmail || ""
    };

    // Auto-advance status logic
    let newStatus = profile.statusRpl || "PENDAFTARAN";
    const hasSMAOrHigher = nextCV.formalEducation.some((edu: any) => {
      if (!edu.level) return false;
      const lvl = edu.level.toUpperCase();
      return lvl.includes("SMA") || lvl.includes("SMK") || lvl.includes("MA") || lvl.includes("SLTA") || 
             lvl.includes("D1") || lvl.includes("D2") || lvl.includes("D3") || lvl.includes("D4") || 
             lvl.includes("S1") || lvl.includes("S2") || lvl.includes("S3") || lvl.includes("SARJANA") || lvl.includes("DIPLOMA");
    });
    
    const hasCurrentWork = !!(nextCV.currentWork.institution && nextCV.currentWork.position);
    
    if (hasSMAOrHigher && hasCurrentWork) {
      if (newStatus === "PENDAFTARAN" || newStatus === "LENGKAPI_CV") {
        newStatus = "PEMBAYARAN";
      }
    }

    await ApplicantProfile.updateOne(
      { _id: profile._id },
      {
        $set: {
          "cv.currentWork": nextCV.currentWork,
          "cv.formalEducation": nextCV.formalEducation,
          "cv.nonFormalEducation": nextCV.nonFormalEducation,
          "cv.trainings": nextCV.trainings,
          "cv.workExperience": nextCV.workExperience,
          "cv.conferences": nextCV.conferences,
          "cv.achievements": nextCV.achievements,
          "cv.organizations": nextCV.organizations,
          work: nextWork,
          statusRpl: newStatus,
        },
      },
      { runValidators: true }
    );

    // We update the status if it's currently PENDAFTARAN or LENGKAPI_CV to PEMBAYARAN,
    // assuming they also finished biodata. Since Biodata and CV are under LENGKAPI_CV,
    // we can transition them. However, since the exact transition logic might require validation 
    // of BOTH being completely filled, let's just mark the document as modified and save it.
    // The dashboard page will handle UI states.
    
    // Check if both biodata and CV are complete to transition to PEMBAYARAN.
    // In this basic version, we just save the CV. 
    revalidatePath("/dashboard/mahasiswa/cv");
    revalidatePath("/dashboard/mahasiswa");

    return { success: true };
  } catch (error: any) {
    console.error("saveCVData Error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}
