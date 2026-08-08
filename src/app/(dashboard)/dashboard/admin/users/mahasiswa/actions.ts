"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import { ApplicantProfile } from "@/models/ApplicantProfile";
import { Period } from "@/models/Period";
import { User } from "@/models/User";

const pagePath = "/dashboard/admin/users/mahasiswa";

function sendMessage(type: "success" | "error", message: string): never {
  redirect(`${pagePath}?status=${type}&message=${encodeURIComponent(message)}`);
}

async function assertAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    sendMessage("error", "Aksi ini hanya dapat dilakukan oleh admin.");
  }
  return session;
}

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createStudentUser(formData: FormData) {
  await assertAdmin();
  await connectMongoDB();

  const name = readText(formData, "name");
  const username = readText(formData, "username").toLowerCase();
  const email = readText(formData, "email").toLowerCase();
  const phone = readText(formData, "phone");
  const password = readText(formData, "password");

  if (!name || !username || !password) {
    sendMessage("error", "Nama, username, dan password wajib diisi.");
  }

  if (password.length < 6) {
    sendMessage("error", "Password minimal 6 karakter.");
  }

  const existingUser = await User.findOne({ username }).lean();
  if (existingUser) {
    sendMessage("error", "Username sudah digunakan.");
  }

  const activePeriod = await Period.findOne({ isActive: true }).lean();
  if (!activePeriod) {
    sendMessage("error", "Periode aktif belum tersedia. Aktifkan periode RPL terlebih dahulu.");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    username,
    email,
    passwordHash,
    role: "mahasiswa",
    status: "aktif",
  });

  await ApplicantProfile.create({
    userId: user._id,
    periodId: activePeriod._id,
    periodName: activePeriod.namaPeriode,
    statusRpl: "PENDAFTARAN",
    identity: {
      fullName: name,
    },
    contact: {
      email,
      phone,
    },
    progress: {
      paymentStatus: "BELUM_BAYAR",
      f02Status: "BELUM",
      f03Status: "BELUM",
      assessmentStatus: "BELUM",
      resultStatus: "BELUM",
    },
  });

  revalidatePath(pagePath);
  sendMessage("success", `Akun mahasiswa ${username} berhasil dibuat.`);
}

export async function resetStudentPassword(formData: FormData) {
  await assertAdmin();
  await connectMongoDB();

  const id = readText(formData, "id");
  const password = readText(formData, "password");

  if (!isValidObjectId(id)) {
    sendMessage("error", "ID akun tidak valid.");
  }

  if (password.length < 6) {
    sendMessage("error", "Password baru minimal 6 karakter.");
  }

  const user = await User.findById(id).lean();
  if (!user || user.role !== "mahasiswa") {
    sendMessage("error", "Akun mahasiswa tidak ditemukan.");
  }

  const passwordHash = await hashPassword(password);
  await User.updateOne({ _id: id }, { $set: { passwordHash } });

  revalidatePath(pagePath);
  sendMessage("success", `Password ${user.username} berhasil direset.`);
}

export async function deleteStudentUser(formData: FormData) {
  await assertAdmin();
  await connectMongoDB();

  const id = readText(formData, "id");
  const confirmation = readText(formData, "confirmation").toUpperCase();

  if (!isValidObjectId(id)) {
    sendMessage("error", "ID akun tidak valid.");
  }

  if (confirmation !== "HAPUS") {
    sendMessage("error", "Ketik HAPUS untuk mengonfirmasi penghapusan akun.");
  }

  const user = await User.findById(id).lean();
  if (!user || user.role !== "mahasiswa") {
    sendMessage("error", "Akun mahasiswa tidak ditemukan.");
  }

  await ApplicantProfile.deleteOne({ userId: id });
  await User.deleteOne({ _id: id });

  revalidatePath(pagePath);
  sendMessage("success", `Akun mahasiswa ${user.username} berhasil dihapus.`);
}
