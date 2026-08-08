import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
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

async function findProfile(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return ApplicantProfile.findById(id).populate("userId", "username name email status").lean();
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectMongoDB();

  const { id } = await params;
  const profile = await findProfile(id);

  if (!profile) {
    return NextResponse.json({ message: "Mahasiswa tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ data: serializeApplicant(profile as never) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await connectMongoDB();

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  const formData = await request.formData();
  const profile = await ApplicantProfile.findById(id);

  if (!profile) {
    return NextResponse.json({ message: "Mahasiswa tidak ditemukan." }, { status: 404 });
  }

  const user = await User.findById(profile.userId);
  if (!user) {
    return NextResponse.json({ message: "Akun mahasiswa tidak ditemukan." }, { status: 404 });
  }

  const name = cleanText(formData.get("name"));
  const email = cleanText(formData.get("email")).toLowerCase();
  const phone = cleanText(formData.get("phone"));
  const nik = cleanText(formData.get("nik"));
  const registrationNumber = cleanText(formData.get("registrationNumber"));
  const nim = cleanText(formData.get("nim"));
  const periodName = cleanText(formData.get("periodName"));
  const program = cleanText(formData.get("program"));
  const concentration = cleanText(formData.get("concentration"));
  const placeOfBirth = cleanText(formData.get("placeOfBirth"));
  const dateOfBirth = cleanText(formData.get("dateOfBirth"));
  const address = cleanText(formData.get("address"));
  const statusRpl = cleanText(formData.get("statusRpl")) || "PENDAFTARAN";

  if (!name) {
    return NextResponse.json({ message: "Nama wajib diisi." }, { status: 400 });
  }

  if (!isStatusRpl(statusRpl)) {
    return NextResponse.json({ message: "Status RPL tidak valid." }, { status: 400 });
  }

  user.name = name;
  user.email = email;

  profile.registrationNumber = registrationNumber || undefined;
  profile.nim = nim || undefined;
  profile.periodName = periodName;
  profile.program = program;
  profile.concentration = concentration;
  profile.statusRpl = statusRpl;
  profile.set("identity.fullName", name);
  profile.set("identity.nik", nik);
  profile.set("identity.placeOfBirth", placeOfBirth);
  profile.set("identity.dateOfBirth", dateOfBirth ? new Date(dateOfBirth) : undefined);
  profile.set("contact.email", email);
  profile.set("contact.phone", phone);
  profile.set("contact.address", address);

  await Promise.all([user.save(), profile.save()]);

  const updated = await ApplicantProfile.findById(id).populate("userId", "username name email status").lean();

  return NextResponse.json({ data: serializeApplicant(updated as never) });
}
