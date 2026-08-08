import { cookies } from "next/headers";
import { isRole } from "@/lib/roles";
import { sessionCookieName, type SessionUser } from "@/lib/session-config";

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, Buffer.from(JSON.stringify(user)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(sessionCookieName)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionUser;
    if (!parsed.id || !parsed.username || !isRole(parsed.role)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export type { SessionUser };
