import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { getEligiblePenilaiForKlaster } from "@/lib/penilai-eligibility";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const klasterId = req.nextUrl.searchParams.get("klasterId");
    const mahasiswaId = req.nextUrl.searchParams.get("mahasiswaId");
    if (!klasterId) {
      return NextResponse.json({ message: "klasterId diperlukan" }, { status: 400 });
    }

    await connectMongoDB();

    // Fetch mappings for this klaster. Jika mahasiswa dikirim, gunakan periode mahasiswa.
    const activePeriod = await Period.findOne({ isActive: true }).lean();
    const profile = mahasiswaId ? await ApplicantProfile.findOne({ userId: mahasiswaId }).lean() : null;
    const periodId = profile?.periodId?.toString() || activePeriod?._id?.toString();
    if (!periodId) {
      return NextResponse.json({ message: "Tidak ada periode aktif" }, { status: 400 });
    }

    const { isSkFinal, eligiblePenilai } = await getEligiblePenilaiForKlaster(periodId, klasterId);
    
    if (!isSkFinal) {
      return NextResponse.json({ data: [], isSkFinal: false });
    }

    return NextResponse.json({ data: eligiblePenilai, isSkFinal: true });
  } catch (error: any) {
    console.error("Error fetching penilai by klaster:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
