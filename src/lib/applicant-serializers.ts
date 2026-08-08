import type { Types } from "mongoose";

type LooseUser = {
  _id: Types.ObjectId;
  username?: string;
  name?: string;
  email?: string;
  status?: string;
};

type LooseProfile = {
  _id: Types.ObjectId;
  userId: LooseUser | Types.ObjectId;
  registrationNumber?: string;
  nim?: string;
  periodName?: string;
  program?: string;
  concentration?: string;
  statusRpl?: string;
  identity?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  work?: Record<string, unknown>;
  cv?: Record<string, unknown>;
  progress?: Record<string, unknown>;
  documents?: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
};

function asUser(value: LooseProfile["userId"]): LooseUser | null {
  if (typeof value === "object" && value && "username" in value) {
    return value as LooseUser;
  }

  return null;
}

export function serializeApplicant(profile: LooseProfile) {
  const user = asUser(profile.userId);
  const identity = profile.identity ?? {};
  const contact = profile.contact ?? {};
  const progress = profile.progress ?? {};

  return {
    id: profile._id.toString(),
    userId: user?._id?.toString() ?? profile.userId.toString(),
    username: user?.username ?? "",
    userStatus: user?.status ?? "aktif",
    name: user?.name ?? identity.fullName ?? "",
    email: user?.email ?? contact.email ?? "",
    registrationNumber: profile.registrationNumber ?? "",
    nim: profile.nim ?? "",
    periodName: profile.periodName ?? "",
    program: profile.program ?? "",
    concentration: profile.concentration ?? "",
    statusRpl: profile.statusRpl ?? "PENDAFTARAN",
    identity,
    contact,
    work: profile.work ?? {},
    cv: profile.cv ?? {},
    progress: {
      paymentStatus: progress.paymentStatus ?? "BELUM_BAYAR",
      f02Status: progress.f02Status ?? "BELUM",
      f03Status: progress.f03Status ?? "BELUM",
      assessmentStatus: progress.assessmentStatus ?? "BELUM",
      resultStatus: progress.resultStatus ?? "BELUM"
    },
    documents: profile.documents ?? [],
    createdAt: profile.createdAt?.toISOString() ?? null,
    updatedAt: profile.updatedAt?.toISOString() ?? null
  };
}
