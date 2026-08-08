import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { Period } from "@/models/Period";
import { ApplicantProfile } from "@/models/ApplicantProfile";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectMongoDB();
    const periods = await Period.find().sort({ namaPeriode: 1 }).lean();

    // Get applicant counts per period
    const counts = await ApplicantProfile.aggregate([
      { $group: { _id: "$periodId", count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toString()] = curr.count;
      }
      return acc;
    }, {} as Record<string, number>);

    const data = periods.map(p => ({
      id: p._id.toString(),
      namaPeriode: p.namaPeriode,
      semester: p.semester,
      tahunAkademik: p.tahunAkademik,
      status: p.status,
      isActive: p.isActive,
      applicantCount: countMap[p._id.toString()] || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching periods:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { namaPeriode, semester, tahunAkademik } = body;

    if (!namaPeriode) {
      return NextResponse.json({ message: "Nama Periode wajib diisi" }, { status: 400 });
    }

    await connectMongoDB();

    const newPeriod = await Period.create({
      namaPeriode,
      semester: semester || "",
      tahunAkademik: tahunAkademik || "",
      isActive: false, // Default newly created periods to false
      status: "Non-Aktif"
    });

    return NextResponse.json({
      message: "Periode berhasil ditambahkan",
      data: {
        id: newPeriod._id,
        namaPeriode: newPeriod.namaPeriode,
        semester: newPeriod.semester,
        tahunAkademik: newPeriod.tahunAkademik,
        status: newPeriod.status,
        isActive: newPeriod.isActive
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating period:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
