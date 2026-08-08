import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PenilaiProfile } from "@/models/PenilaiProfile";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["aktif", "nonaktif"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, role: "penilai" },
      { $set: { status } },
      { new: true }
    );

    if (!user) return NextResponse.json({ message: "Penilai tidak ditemukan" }, { status: 404 });

    await PenilaiProfile.findOneAndUpdate(
      { userId: id },
      { $set: { isActive: status === "aktif" } }
    );

    return NextResponse.json({ message: "Status penilai berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating penilai status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
