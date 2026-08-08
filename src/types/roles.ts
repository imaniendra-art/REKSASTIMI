export const roles = ["admin", "akademik", "keuangan", "penilai", "mahasiswa"] as const;

export type Role = (typeof roles)[number];
