import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PenilaiKlaster } from "@/models/PenilaiKlaster";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongoDB();
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { klasterIds } = body;

    if (!Array.isArray(klasterIds)) {
      return NextResponse.json({ message: "Format klasterIds tidak valid" }, { status: 400 });
    }

    const user = await User.findOne({ _id: id, role: "penilai" }).lean();
    if (!user) return NextResponse.json({ message: "Penilai tidak ditemukan" }, { status: 404 });

    // Find existing mappings
    const existingMappings = await PenilaiKlaster.find({ penilaiId: id }).lean();
    const existingKlasterIds = existingMappings.map((m: any) => m.klasterId.toString());

    // Klaster to add
    const toAdd = klasterIds.filter(kid => !existingKlasterIds.includes(kid));
    
    // Klaster to reactivate
    const toReactivate = klasterIds.filter(kid => {
      const mapping = existingMappings.find((m: any) => m.klasterId.toString() === kid);
      return mapping && !mapping.isActive;
    });

    // Klaster to deactivate
    const toDeactivate = existingKlasterIds.filter(kid => !klasterIds.includes(kid));

    // Execute updates
    if (toDeactivate.length > 0) {
      await PenilaiKlaster.updateMany(
        { penilaiId: id, klasterId: { $in: toDeactivate } },
        { $set: { isActive: false } }
      );
    }

    if (toReactivate.length > 0) {
      await PenilaiKlaster.updateMany(
        { penilaiId: id, klasterId: { $in: toReactivate } },
        { $set: { isActive: true } }
      );
    }

    if (toAdd.length > 0) {
      const newMappings = toAdd.map(kid => ({
        penilaiId: id,
        klasterId: kid,
        assignedBy: session.id,
        isActive: true
      }));
      await PenilaiKlaster.insertMany(newMappings);
    }

    return NextResponse.json({ message: "Mapping klaster berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating penilai mapping:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
