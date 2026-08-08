import type { Role } from "@/types/roles";

export type MenuItem = {
  label: string;
  href: string;
  description: string;
  tone: "primary" | "success" | "warning" | "danger" | "info" | "dark" | "secondary";
  children?: Omit<MenuItem, "children">[];
};

export const workflowSteps = [
  "PENDAFTARAN",
  "LENGKAPI CV",
  "PEMBAYARAN",
  "ASESMEN F02",
  "ASESMEN KOMPETENSI",
  "EVALUASI F03",
  "EVALUASI PENILAI",
  "KONFIRMASI HASIL",
  "SIAP PLENO",
  "LULUS"
] as const;

export const roleMenu: Record<Role, MenuItem[]> = {
  admin: [
    {
      label: "Portal Command Center",
      href: "/dashboard/admin",
      description: "Ringkasan seluruh proses RPL.",
      tone: "primary"
    },
    {
      label: "Manajemen Mahasiswa",
      href: "/dashboard/admin/mahasiswa",
      description: "Ringkasan pendaftar dan statistik.",
      tone: "primary",
      children: [
        {
          label: "Data Pendaftar",
          href: "/dashboard/admin/mahasiswa/data-pendaftar",
          description: "Master data dan progres pendaftar.",
          tone: "primary"
        },
        {
          label: "Pusat Download",
          href: "/dashboard/admin/mahasiswa/pusat-download",
          description: "Status berkas dan unduh dokumen.",
          tone: "info"
        },
        {
          label: "Nilai Asesmen",
          href: "/dashboard/admin/mahasiswa/nilai-asesmen",
          description: "Transkrip dan pelaporan.",
          tone: "success"
        }
      ]
    },
    {
      label: "Manajemen Akademik",
      href: "/dashboard/akademik",
      description: "Kurikulum, mata kuliah RPL, dan klaster.",
      tone: "success"
    },
    {
      label: "Manajemen Penilai",
      href: "/dashboard/admin/penilai",
      description: "Data penilai dan plotting f03.",
      tone: "danger",
      children: [
        {
          label: "Data Penilai",
          href: "/dashboard/admin/penilai/data-penilai",
          description: "Data penilai dan mapping keahlian.",
          tone: "danger"
        },
        {
          label: "Plotting F03",
          href: "/dashboard/admin/plotting-f03",
          description: "Tugaskan mahasiswa ke penilai sesuai klaster.",
          tone: "warning"
        },
        {
          label: "Hasil Penilaian F03",
          href: "/dashboard/admin/hasil-penilaian-f03",
          description: "Daftar hasil penilaian F03.",
          tone: "info"
        }
      ]
    },
    {
      label: "Manajemen Asesmen (LMS)",
      href: "/dashboard/admin/lms",
      description: "Materi dan bank soal asesmen kompetensi.",
      tone: "warning"
    },
    {
      label: "SK Generator RPL",
      href: "/dashboard/admin/sk-generator",
      description: "Kelola SK dan dokumen legal RPL sejak periode dibuka.",
      tone: "secondary"
    },
    {
      label: "Pusat Dokumen RPL",
      href: "/dashboard/admin/dokumen-rpl",
      description: "Kelola kesiapan, penomoran, dan cetak dokumen RPL.",
      tone: "info"
    },
    {
      label: "Keuangan",
      href: "/dashboard/keuangan",
      description: "Validasi pembayaran dan rekap dana.",
      tone: "success"
    },
    {
      label: "Periode",
      href: "/dashboard/admin/periode",
      description: "Buka/tutup batch pendaftaran.",
      tone: "secondary"
    },
    {
      label: "Pusat Akun",
      href: "/dashboard/admin/users",
      description: "Pengguna, role, dan keamanan sistem.",
      tone: "dark",
      children: [
        {
          label: "Daftar Akun Pengelola",
          href: "/dashboard/admin/users/pengelola",
          description: "Super admin, keuangan, akademik, dan penilai.",
          tone: "dark"
        },
        {
          label: "Daftar Akun Mahasiswa",
          href: "/dashboard/admin/users/mahasiswa",
          description: "Daftar akun mahasiswa RPL.",
          tone: "info"
        }
      ]
    }
  ],
  akademik: [
    {
      label: "Data Akademik",
      href: "/dashboard/akademik",
      description: "Manajemen kurikulum dan klaster ilmu.",
      tone: "primary"
    },
    {
      label: "Master Kurikulum",
      href: "/dashboard/akademik/kurikulum",
      description: "Database seluruh mata kuliah prodi.",
      tone: "primary"
    },
    {
      label: "Mata Kuliah RPL",
      href: "/dashboard/akademik/matkul-rpl",
      description: "Daftar mata kuliah jalur RPL.",
      tone: "success"
    },
    {
      label: "Data Klaster",
      href: "/dashboard/akademik/klaster",
      description: "Rumpun ilmu untuk plotting penilai.",
      tone: "info"
    },
    {
      label: "Evaluasi Pleno",
      href: "/dashboard/akademik/evaluasi",
      description: "Konfirmasi hasil dan finalisasi akademik.",
      tone: "warning"
    }
  ],
  keuangan: [
    {
      label: "Panel Kendali Keuangan",
      href: "/dashboard/keuangan",
      description: "Verifikasi pembayaran dan monitoring dana.",
      tone: "primary"
    },
    {
      label: "Rekapitulasi Dana",
      href: "/dashboard/keuangan/rekap",
      description: "Rekap pembayaran pendaftar.",
      tone: "success"
    },
    {
      label: "Antrean Validasi",
      href: "/dashboard/keuangan/validasi",
      description: "Bukti bayar menunggu pemeriksaan.",
      tone: "warning"
    }
  ],
  penilai: [
    {
      label: "Dashboard Penilai",
      href: "/dashboard/penilai",
      description: "Daftar asesmen per klaster.",
      tone: "primary"
    },
    {
      label: "Biodata Profil",
      href: "/dashboard/penilai/biodata",
      description: "Pengaturan profil penilai.",
      tone: "primary"
    },
    {
      label: "Histori Penilaian",
      href: "/dashboard/penilai/riwayat",
      description: "Riwayat asesmen yang sudah selesai.",
      tone: "dark"
    }
  ],
  mahasiswa: [
    {
      label: "Dashboard Mahasiswa",
      href: "/dashboard/mahasiswa",
      description: "Roadmap dan status proses RPL.",
      tone: "primary"
    },
    {
      label: "Biodata",
      href: "/dashboard/mahasiswa/biodata",
      description: "Data diri, orang tua, dan alamat.",
      tone: "primary"
    },
    {
      label: "CV Riwayat",
      href: "/dashboard/mahasiswa/cv",
      description: "Pendidikan, pekerjaan, dan organisasi.",
      tone: "warning"
    },
    {
      label: "Keuangan",
      href: "/dashboard/mahasiswa/keuangan",
      description: "Tagihan dan bukti pembayaran.",
      tone: "danger"
    },
    {
      label: "Form F02",
      href: "/dashboard/mahasiswa/f02",
      description: "Pemilihan mata kuliah RPL.",
      tone: "success"
    },
    {
      label: "Test Kompetensi RPL",
      href: "/dashboard/mahasiswa/asesmen",
      description: "Ujian dan capaian pembelajaran.",
      tone: "info"
    },
    {
      label: "Form F03",
      href: "/dashboard/mahasiswa/f03",
      description: "Evaluasi diri dan portofolio.",
      tone: "secondary"
    },
    {
      label: "Pusat Download",
      href: "/dashboard/mahasiswa/download",
      description: "Unduh berkas RPL.",
      tone: "dark"
    }
  ]
};

export function getMenuIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("mahasiswa") || l.includes("pendaftar")) return "👨‍🎓";
  if (l.includes("akademik") || l.includes("kurikulum") || l.includes("matkul") || l.includes("klaster")) return "🎓";
  if (l.includes("keuangan") || l.includes("dana") || l.includes("bayar") || l.includes("validasi") || l.includes("rekap")) return "💰";
  if (l.includes("download") || l.includes("unduh")) return "⬇️";
  if (l.includes("asesmen") || l.includes("nilai") || l.includes("evaluasi") || l.includes("riwayat")) return "📊";
  if (l.includes("penilai") || l.includes("asesor")) return "⚖️";
  if (l.includes("lms") || l.includes("test") || l.includes("matrikulasi")) return "💻";
  if (l.includes("dokumen") || l.includes("sk") || l.includes("f02") || l.includes("f03") || l.includes("cv") || l.includes("biodata")) return "📄";
  if (l.includes("periode")) return "📅";
  if (l.includes("akun") || l.includes("user")) return "👤";
  if (l.includes("dashboard") || l.includes("command center") || l.includes("panel")) return "🏠";
  return "📌";
}
