import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { AssessmentQuestion } from "@/models/AssessmentQuestion";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectMongoDB();
    const klasters = await Klaster.find().sort({ createdAt: -1 }).lean();

    const data = await Promise.all(klasters.map(async (k: any) => {
      const klasterId = k._id.toString();
      const matkulCount = await KlasterMatkul.countDocuments({ klasterId: klasterId });
      const soalCount = await AssessmentQuestion.countDocuments({ klaster: klasterId });
      
      const activeMaterials = (k.learningMaterials || []).filter((m: any) => m.isActive);
      const videoCount = activeMaterials.filter((m: any) => m.videoUrl && m.videoUrl.trim() !== "").length;
      const pretestCount = activeMaterials.reduce((sum: number, m: any) => sum + (m.pretestQuestions?.length || 0), 0);
      
      return {
        id: klasterId,
        namaKlaster: k.namaKlaster,
        deskripsi: k.deskripsi,
        lmsDeskripsi: k.lmsDeskripsi || "",
        lmsVideos: k.lmsVideos || [],
        lmsDocuments: k.lmsDocuments || [],
        gradeBooster: k.gradeBooster || false,
        isActive: k.isActive !== false, // default true
        matkulCount,
        soalCount,
        videoCount,
        pretestCount,
        materialCount: activeMaterials.length,
        createdAt: k.createdAt,
      };
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching klaster:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
