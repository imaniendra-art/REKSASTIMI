import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplPeriodTeam } from "@/models/RplPeriodTeam";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const periodId = req.nextUrl.searchParams.get("periodId");
    if (!periodId) return NextResponse.json({ message: "periodId diperlukan" }, { status: 400 });

    await connectMongoDB();
    const team = await RplPeriodTeam.find({ periodId }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ data: team });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    const body = await req.json();
    const { periodId, nama, jabatanDalamTim, unsur, isActive } = body;

    if (!periodId || !nama || !jabatanDalamTim) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    await connectMongoDB();
    const newTeamMember = await RplPeriodTeam.create({
      periodId,
      nama,
      jabatanDalamTim,
      unsur,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ message: "Anggota tim berhasil ditambahkan", data: newTeamMember });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
