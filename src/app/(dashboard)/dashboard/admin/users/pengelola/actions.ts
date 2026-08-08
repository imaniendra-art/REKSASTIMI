"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import { User } from "@/models/User";
import type { Role } from "@/types/roles";

const managerRoles: Role[] = ["admin", "keuangan", "akademik", "penilai"];
const pagePath = "/dashboard/admin/users/pengelola";

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

export async function createManagerUser(formData: FormData) {
  await assertAdmin();
  await connectMongoDB();

  const name = readText(formData, "name");
  const username = readText(formData, "username").toLowerCase();
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const role = readText(formData, "role") as Role;

  if (!name || !username || !password || !role) {
    sendMessage("error", "Nama, username, password, dan role wajib diisi.");
  }

  if (!managerRoles.includes(role)) {
    sendMessage("error", "Role pengguna baru tidak valid untuk daftar akun pengelola.");
  }

  if (password.length < 6) {
    sendMessage("error", "Password minimal 6 karakter.");
  }

  const existingUser = await User.findOne({ username }).lean();
  if (existingUser) {
    sendMessage("error", "Username sudah digunakan.");
  }

  const passwordHash = await hashPassword(password);
  await User.create({
    name,
    username,
    email,
    passwordHash,
    role,
    status: "aktif",
  });

  revalidatePath(pagePath);
  sendMessage("success", `Akun ${username} berhasil dibuat.`);
}

export async function resetManagerPassword(formData: FormData) {
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
  if (!user || !managerRoles.includes(user.role as Role)) {
    sendMessage("error", "Akun pengelola tidak ditemukan.");
  }

  const passwordHash = await hashPassword(password);
  await User.updateOne({ _id: id }, { $set: { passwordHash } });

  revalidatePath(pagePath);
  sendMessage("success", `Password ${user.username} berhasil direset.`);
}

export async function deleteManagerUser(formData: FormData) {
  const session = await assertAdmin();
  await connectMongoDB();

  const id = readText(formData, "id");
  const confirmation = readText(formData, "confirmation").toUpperCase();

  if (!isValidObjectId(id)) {
    sendMessage("error", "ID akun tidak valid.");
  }

  if (id === session.id) {
    sendMessage("error", "Akun yang sedang digunakan tidak boleh dihapus.");
  }

  if (confirmation !== "HAPUS") {
    sendMessage("error", "Ketik HAPUS untuk mengonfirmasi penghapusan akun.");
  }

  const user = await User.findById(id).lean();
  if (!user || !managerRoles.includes(user.role as Role)) {
    sendMessage("error", "Akun pengelola tidak ditemukan.");
  }

  if (user.role === "admin") {
    const adminTotal = await User.countDocuments({ role: "admin" });
    if (adminTotal <= 1) {
      sendMessage("error", "Admin terakhir tidak boleh dihapus.");
    }
  }

  await User.deleteOne({ _id: id });

  revalidatePath(pagePath);
  sendMessage("success", `Akun ${user.username} berhasil dihapus.`);
}
