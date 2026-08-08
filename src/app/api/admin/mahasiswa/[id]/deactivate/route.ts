import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { User } from "@/models/User";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectMongoDB();

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const profile = await ApplicantProfile.findById(id);
  if (!profile) {
    return NextResponse.json({ message: "Mahasiswa tidak ditemukan." }, { status: 404 });
  }

  await Promise.all([
    User.updateOne({ _id: profile.userId }, { $set: { status: "nonaktif" } }),
    ApplicantProfile.updateOne({ _id: id }, { $set: { isActive: false } })
  ]);

  return NextResponse.json({ message: "Mahasiswa dinonaktifkan." });
}
