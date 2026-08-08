import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { User } from "@/models/User";
import { Period } from "@/models/Period";
import { RplDocument } from "@/models/RplDocument";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    await connectMongoDB();

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const periodId = url.searchParams.get("periodId");
    const statusBundleFilter = url.searchParams.get("statusBundle");
    const statusRplFilter = url.searchParams.get("statusRpl");

    // Start building query
    const profileQuery: any = {};
    if (statusRplFilter) profileQuery.statusRpl = statusRplFilter;

    // We fetch profiles first
    let profiles = await ApplicantProfile.find(profileQuery).lean();

    // Enrich with User data
    const userIds = profiles.map(p => p.userId);
    const users = await User.find({ _id: { $in: userIds }, role: "mahasiswa" }).lean();
    
    // Enrich with Period data
    const periods = await Period.find({}).lean();

    // Enrich with RplDocuments (Bundle status)
    const bundleDocs = await RplDocument.find({ 
        mahasiswaId: { $in: userIds },
        documentType: "BUNDLE"
    }).lean();

    const result = [];

    for (const profile of profiles) {
        const user = users.find(u => u._id.toString() === profile.userId.toString());
        if (!user) continue;

        const period = periods.find(p => p._id.toString() === profile.periodId?.toString());
        
        // Filter by periodId
        if (periodId && period?._id.toString() !== periodId) continue;

        // Search
        if (search) {
            const nameMatch = user.name?.toLowerCase().includes(search);
            const regMatch = user.username?.toLowerCase().includes(search);
            if (!nameMatch && !regMatch) continue;
        }

        const bundleDoc = bundleDocs.find((b: any) => b.mahasiswaId.toString() === user._id.toString());
        const statusBundle = bundleDoc ? bundleDoc.status : "Belum Siap";

        if (statusBundleFilter && statusBundle !== statusBundleFilter) continue;

        // In a real app we might calculate siapCetak dynamically, but for the list view,
        // we can just use the status of existing documents or approximate.
        // For performance, we'll just return the bundle status and let the detail page do the deep check.
        
        result.push({
            mahasiswaId: user._id.toString(),
            nama: user.name,
            username: user.username,
            periode: period ? period.namaPeriode : "Tanpa Periode",
            statusRpl: profile.statusRpl,
            progressResultStatus: profile.progress?.resultStatus || "UNKNOWN",
            statusBundle,
            alasanBelumSiap: statusBundle === "Belum Siap" ? "Dokumen wajib belum lengkap / belum digenerate" : ""
        });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("Error fetching list dokumen RPL:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
