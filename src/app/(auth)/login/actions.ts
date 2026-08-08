"use server";

import { redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { dashboardByRole, isRole } from "@/lib/roles";
import { setSession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { User } from "@/models/User";

export type LoginState = {
  error?: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  await connectMongoDB();

  const user = await User.findOne({ username, status: "aktif" }).lean();

  if (!user) {
    return { error: "Username atau password salah." };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    return { error: "Username atau password salah." };
  }

  // Auto-upgrade plain password to bcrypt if needed
  if (user.passwordHash.startsWith("plain:")) {
    const { hashPassword } = await import("@/lib/password");
    const newHash = await hashPassword(password);
    await User.updateOne({ _id: user._id }, { $set: { passwordHash: newHash } });
  }

  if (!isRole(user.role)) {
    return { error: "Role akun tidak valid." };
  }

  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

  await setSession({
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    role: user.role
  });

  redirect(dashboardByRole[user.role]);
}
