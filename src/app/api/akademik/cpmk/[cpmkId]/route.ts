import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { MatkulCpmk } from "@/models/MatkulCpmk";

export async function DELETE(req: Request, { params }: { params: Promise<{ cpmkId: string }> }) {
  try {
    await connectMongoDB();
    const { cpmkId } = await params;
    const cpmk = await MatkulCpmk.findByIdAndDelete(cpmkId);
    
    if (!cpmk) {
      return NextResponse.json({ error: "CPMK not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "CPMK deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
