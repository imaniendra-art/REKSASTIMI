import type { Role } from "@/types/roles";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

export const sessionCookieName = "reksa_session";
