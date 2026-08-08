import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeApplicant } from "@/lib/applicant-serializers";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { User } from "@/models/User";

const statusRplValues = [
  "PENDAFTARAN",
  "LENGKAPI_CV",
  "PEMBAYARAN",
  "ASESMEN_F02",
  "ASESMEN_KOMPETENSI",
  "EVALUASI_F03",
  "EVALUASI_ASESOR",
  "KONFIRMASI_HASIL",
  "SIAP_PLENO",
  "LULUS"
] as const;

type StatusRpl = (typeof statusRplValues)[number];

function isStatusRpl(value: string): value is StatusRpl {
  return statusRplValues.includes(value as StatusRpl);
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function toRegex(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function csvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectMongoDB();

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  const period = searchParams.get("period")?.trim() ?? "";
  const statusRpl = searchParams.get("statusRpl")?.trim() ?? "";
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 50);

  const userFilter: Record<string, unknown> = { role: "mahasiswa" };
  if (q) {
    const regex = toRegex(q);
    userFilter.$or = [{ name: regex }, { email: regex }, { username: regex }];
  }

  const matchingUsers = await User.find(userFilter).select("_id").lean();
  const userIds = matchingUsers.map((user) => user._id);

  const profileFilter: Record<string, unknown> = q ? {} : { userId: { $in: userIds } };
  if (period) profileFilter.periodName = period;
  if (statusRpl) profileFilter.statusRpl = statusRpl;

  if (q) {
    const regex = toRegex(q);
    profileFilter.$or = [
      { userId: { $in: userIds } },
      { registrationNumber: regex },
      { nim: regex },
      { "identity.nik": regex },
      { "identity.fullName": regex },
      { "contact.email": regex },
      { "contact.phone": regex }
    ];
  }

  const [total, profiles, periods] = await Promise.all([
    ApplicantProfile.countDocuments(profileFilter),
    ApplicantProfile.find(profileFilter)
      .populate("userId", "username name email status")
      .sort({ "identity.fullName": 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ApplicantProfile.distinct("periodName", { periodName: { $nin: [null, ""] } })
  ]);

  const serialized = profiles.map((profile) => serializeApplicant(profile as never));

  if (searchParams.get("export") === "csv") {
    const header = [
      "Nama",
      "Username",
      "NIK",
      "No Pendaftar",
      "Email",
      "WhatsApp",
      "Periode",
      "Status RPL",
      "Status Pembayaran",
      "Status F02",
      "Status F03",
      "Status Asesmen",
      "Status Hasil",
      "Status Akun"
    ];
    const rows = serialized.map((item) => [
      item.name,
      item.username,
      item.identity?.nik,
      item.registrationNumber || item.nim,
      item.email || item.contact?.email,
      item.contact?.phone,
      item.periodName,
      item.statusRpl,
      item.progress.paymentStatus,
      item.progress.f02Status,
      item.progress.f03Status,
      item.progress.assessmentStatus,
      item.progress.resultStatus,
      item.userStatus
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"daftar-mahasiswa-reksa.csv\""
      }
    });
  }

  return NextResponse.json({
    data: serialized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    },
    filters: {
      periods: periods.sort(),
      statuses: statusRplValues
    }
  });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectMongoDB();

  const formData = await request.formData();
  const name = cleanText(formData.get("name"));
  const username = cleanText(formData.get("username")).toLowerCase();
  const email = cleanText(formData.get("email")).toLowerCase();
  const phone = cleanText(formData.get("phone"));
  const nik = cleanText(formData.get("nik"));
  const registrationNumber = cleanText(formData.get("registrationNumber"));
  const periodName = cleanText(formData.get("periodName"));
  const statusRpl = cleanText(formData.get("statusRpl")) || "PENDAFTARAN";

  if (!name || !username) {
    return NextResponse.json({ message: "Nama dan username wajib diisi." }, { status: 400 });
  }

  if (!isStatusRpl(statusRpl)) {
    return NextResponse.json({ message: "Status RPL tidak valid." }, { status: 400 });
  }

  const existingUser = await User.findOne({ username }).lean();
  if (existingUser) {
    return NextResponse.json({ message: "Username sudah digunakan." }, { status: 409 });
  }

  if (registrationNumber) {
    const existingReg = await ApplicantProfile.findOne({ registrationNumber }).lean();
    if (existingReg) {
      return NextResponse.json({ message: "No. pendaftar sudah digunakan." }, { status: 409 });
    }
  }

  const { hashPassword } = await import("@/lib/password");
  const passwordHash = await hashPassword("mahasiswa123");

  const user = await User.create({
    username,
    passwordHash,
    name,
    email,
    role: "mahasiswa",
    status: "aktif"
  });

  const profile = await ApplicantProfile.create({
    userId: user._id,
    registrationNumber: registrationNumber || undefined,
    periodName,
    statusRpl,
    identity: {
      fullName: name,
      nik
    },
    contact: {
      email,
      phone
    }
  });

  const populated = await profile.populate("userId", "username name email status");

  return NextResponse.json({ data: serializeApplicant(populated.toObject() as never) }, { status: 201 });
}
