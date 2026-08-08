import { NextResponse, type NextRequest } from "next/server";
import { dashboardByRole, isRole } from "@/lib/roles";
import { sessionCookieName, type SessionUser } from "@/lib/session-config";
import type { Role } from "@/types/roles";

const guardedPaths: Array<{ path: string; roles: Role[] }> = [
  { path: "/dashboard/admin", roles: ["admin"] },
  { path: "/dashboard/akademik", roles: ["admin", "akademik"] },
  { path: "/dashboard/keuangan", roles: ["admin", "keuangan"] },
  { path: "/dashboard/penilai", roles: ["penilai"] },
  { path: "/dashboard/mahasiswa", roles: ["mahasiswa"] }
];

function readSession(request: NextRequest): SessionUser | null {
  const raw = request.cookies.get(sessionCookieName)?.value;

  if (!raw) {
    return null;
  }

  try {
    const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed = JSON.parse(atob(padded)) as SessionUser;
    if (!parsed.id || !parsed.username || !isRole(parsed.role)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const session = readSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const matchedPath = guardedPaths.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
  const canAccess = !matchedPath || matchedPath.roles.includes(session.role);

  if (!canAccess && pathname !== "/dashboard") {
    return NextResponse.redirect(new URL(dashboardByRole[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
