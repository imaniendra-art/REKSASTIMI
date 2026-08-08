import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { Klaster } from "@/models/Klaster";
import { KlasterMatkul } from "@/models/KlasterMatkul";
import { MataKuliah } from "@/models/MataKuliah";
import { normalizeYoutubeUrl } from "@/lib/youtube";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const resolvedParams = await params;
    await connectMongoDB();
    const klaster = await Klaster.findById(resolvedParams.id).lean();

    if (!klaster) {
      return NextResponse.json({ message: "Klaster tidak ditemukan" }, { status: 404 });
    }

    // Ambil matkul yang tergabung dalam klaster
    const klasterMatkuls = await KlasterMatkul.find({ klasterId: klaster._id })
      .populate({ path: "matkulId", model: MataKuliah, select: "kode namaMatkul sks semester" })
      .lean();

    const matkuls = klasterMatkuls.map((km: any) => ({
      id: km.matkulId._id.toString(),
      kode: km.matkulId.kode,
      namaMatkul: km.matkulId.namaMatkul,
      sks: km.matkulId.sks,
      semester: km.matkulId.semester,
    }));

    const k: any = klaster;
    const data = {
      id: k._id.toString(),
      namaKlaster: k.namaKlaster,
      deskripsi: k.deskripsi,
      lmsDeskripsi: k.lmsDeskripsi || "",
      lmsVideos: k.lmsVideos || [],
      lmsDocuments: k.lmsDocuments || [],
      learningMaterials: k.learningMaterials || [],
      gradeBooster: k.gradeBooster || false,
      isActive: k.isActive !== false,
      matkuls,
      createdAt: k.createdAt,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching klaster detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { lmsDeskripsi, lmsVideos, lmsDocuments, gradeBooster, learningMaterials } = body;

    const resolvedParams = await params;
    await connectMongoDB();

    const updateData: any = {};
    if (lmsDeskripsi !== undefined) updateData.lmsDeskripsi = lmsDeskripsi;
    if (lmsVideos !== undefined) {
      updateData.lmsVideos = Array.isArray(lmsVideos) 
        ? lmsVideos.map(v => normalizeYoutubeUrl(v) || v)
        : lmsVideos;
    }
    if (lmsDocuments !== undefined) updateData.lmsDocuments = lmsDocuments;
    if (gradeBooster !== undefined) updateData.gradeBooster = gradeBooster;
    if (learningMaterials !== undefined) {
      updateData.learningMaterials = Array.isArray(learningMaterials)
        ? learningMaterials.map(m => ({
            ...m,
            videoUrl: m.videoUrl ? normalizeYoutubeUrl(m.videoUrl) || m.videoUrl : m.videoUrl
          }))
        : learningMaterials;
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedKlaster = await Klaster.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true }
    );

    if (!updatedKlaster) {
      return NextResponse.json({ message: "Klaster tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Pengaturan LMS Klaster berhasil diperbarui",
      data: { id: updatedKlaster._id.toString() }
    });
  } catch (error) {
    console.error("Error updating klaster lms settings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
