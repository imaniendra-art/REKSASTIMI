import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return {
      session: null,
      response: NextResponse.json({ message: "Akses ditolak." }, { status: 403 })
    };
  }

  return { session, response: null };
}
