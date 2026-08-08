import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { Period } from "@/models/Period";
import { ApplicantProfile } from "@/models/ApplicantProfile";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    await connectMongoDB();

    const period = await Period.findById(id);
    if (!period) {
      return NextResponse.json({ message: "Periode tidak ditemukan" }, { status: 404 });
    }

    // Support updating fields
    if (body.namaPeriode !== undefined) period.namaPeriode = body.namaPeriode;
    if (body.semester !== undefined) period.semester = body.semester;
    if (body.tahunAkademik !== undefined) period.tahunAkademik = body.tahunAkademik;

    // Toggle active status
    if (body.isActive !== undefined) {
      period.isActive = body.isActive;
    }

    await period.save();

    return NextResponse.json({ message: "Periode berhasil diupdate", data: period });
  } catch (error) {
    console.error("Error updating period:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;

    await connectMongoDB();

    // Check if there are any applicants using this period
    const applicantsCount = await ApplicantProfile.countDocuments({ periodId: id });
    if (applicantsCount > 0) {
      return NextResponse.json(
        { message: "Periode tidak dapat dihapus karena sudah ada pendaftar di periode ini. Cukup nonaktifkan periode." },
        { status: 400 }
      );
    }

    const deleted = await Period.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Periode tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Periode berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting period:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
