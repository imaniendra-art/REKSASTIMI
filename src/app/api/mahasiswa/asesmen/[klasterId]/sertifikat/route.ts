import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { User } from "@/models/User";
import { Klaster } from "@/models/Klaster";
import { ApplicantProfile } from "@/models/ApplicantProfile";

export async function GET(request: NextRequest, { params }: { params: Promise<{ klasterId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });

  try {
    const resolvedParams = await params;
    await connectMongoDB();

    // Fetch the completed attempt
    const attempt = await AssessmentAttempt.findOne({ 
      userId: session.id, 
      klasterId: resolvedParams.klasterId,
      status: "Completed"
    }).lean() as any;

    if (!attempt) {
      return NextResponse.json({ message: "Sertifikat belum tersedia atau tes belum diselesaikan." }, { status: 404 });
    }

    // Fetch User and Profil Data
    const user = await User.findById(session.id).lean();
    const profil = await ApplicantProfile.findOne({ userId: session.id }).lean();
    const klaster = await Klaster.findById(resolvedParams.klasterId).lean();

    if (!user || !klaster) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 500 });
    }

    // Prepare data for the certificate
    return NextResponse.json({
      data: {
        certificateNumber: attempt.certificateNumber || "REKSA-LMS/.../...",
        issuedAt: attempt.certificateIssuedAt || attempt.submittedAt,
        student: {
          fullName: user.name,
          nim: profil?.nim || user.email?.split("@")[0] || "Unknown",
        },
        klaster: {
          namaKlaster: klaster.namaKlaster
        },
        transkrip: attempt.matkulResults.map((res: any) => ({
          matkulName: res.matkulName,
          finalScore: res.finalScore,
          finalGrade: res.finalGrade
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching sertifikat data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
