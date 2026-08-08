import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { RplSkDocument } from "@/models/RplSkDocument";
import { Period } from "@/models/Period";
import { CHECKLIST_AWAL_PERIODE, SkType } from "@/lib/rpl-sk";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });

    let periodId = req.nextUrl.searchParams.get("periodId");
    
    await connectMongoDB();

    if (!periodId) {
      const activePeriod = await Period.findOne({ isActive: true });
      if (activePeriod) {
        periodId = activePeriod._id.toString();
      } else {
        return NextResponse.json({ message: "Tidak ada periode aktif dan periodId tidak diberikan" }, { status: 400 });
      }
    }

    const skList = await RplSkDocument.find({ periodId }).sort({ createdAt: -1 }).lean();

    // Generate Checklist Status
    const checklistStatus: Record<string, string> = {};
    let total = 0, draft = 0, final = 0, perluRevisi = 0, belumAda = 0;

    for (const skType of CHECKLIST_AWAL_PERIODE) {
      const existing = skList.find((sk: any) => sk.skType === skType);
      if (existing) {
        checklistStatus[skType] = existing.status;
        if (existing.status === "DRAFT") draft++;
        else if (existing.status === "FINAL") final++;
        else if (existing.status === "REVISI") perluRevisi++;
        total++;
      } else {
        checklistStatus[skType] = "Belum Ada";
        belumAda++;
      }
    }

    return NextResponse.json({ 
      data: {
        skList,
        checklistStatus,
        summary: {
          total: skList.length,
          draft: skList.filter((sk: any) => sk.status === "DRAFT").length,
          final: skList.filter((sk: any) => sk.status === "FINAL").length,
          perluRevisi: skList.filter((sk: any) => sk.status === "REVISI").length,
          belumAdaAwalPeriode: belumAda
        }
      } 
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
