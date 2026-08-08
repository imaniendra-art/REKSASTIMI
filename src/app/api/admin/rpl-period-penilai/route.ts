import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplPeriodPenilai } from "@/models/RplPeriodPenilai";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const periodId = req.nextUrl.searchParams.get("periodId");
    if (!periodId) return NextResponse.json({ message: "periodId diperlukan" }, { status: 400 });

    await connectMongoDB();
    const penilaiList = await RplPeriodPenilai.find({ periodId })
      .populate("penilaiId", "name username email")
      .populate("klasterIds", "kode nama")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ data: penilaiList });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const body = await req.json();
    const { periodId, penilaiId, jenisPenilai, klasterIds, isActive } = body;

    if (!periodId || !penilaiId) {
      return NextResponse.json({ message: "periodId dan penilaiId diperlukan" }, { status: 400 });
    }

    await connectMongoDB();
    
    // Check if user is actually a penilai
    const user = await User.findById(penilaiId);
    if (!user || user.role !== "penilai") {
      return NextResponse.json({ message: "User tidak ditemukan atau bukan penilai" }, { status: 400 });
    }

    // Check duplicate
    const existing = await RplPeriodPenilai.findOne({ periodId, penilaiId });
    if (existing) {
      return NextResponse.json({ message: "Penilai ini sudah terdaftar pada periode ini" }, { status: 400 });
    }

    const newPenilai = await RplPeriodPenilai.create({
      periodId,
      penilaiId,
      jenisPenilai: jenisPenilai || "Internal",
      klasterIds: klasterIds || [],
      isActive: isActive !== undefined ? isActive : true,
      isEligibleForPlotting: false // Will be true when SK is finalized
    });

    return NextResponse.json({ message: "Penilai berhasil ditambahkan ke periode", data: newPenilai });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
