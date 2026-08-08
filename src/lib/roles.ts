import type { Role } from "@/types/roles";

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  akademik: "Akademik",
  keuangan: "Keuangan",
  penilai: "Penilai",
  mahasiswa: "Mahasiswa"
};

export const dashboardByRole: Record<Role, string> = {
  admin: "/dashboard/admin",
  akademik: "/dashboard/akademik",
  keuangan: "/dashboard/keuangan",
  penilai: "/dashboard/penilai",
  mahasiswa: "/dashboard/mahasiswa"
};

export function isRole(value: string | undefined): value is Role {
  return Boolean(value && value in roleLabels);
}
