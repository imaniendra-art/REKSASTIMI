export const SK_TYPES = [
  "SK_PMB_RPL",
  "SK_PEDOMAN_INSTITUSI",
  "SK_PEDOMAN_PRODI",
  "SK_PENGELOLA_RPL",
  "SK_PENILAI_RPL",
  "SK_PENUGASAN_PENILAI",
  "BA_PLENO",
  "SK_HASIL_RPL"
] as const;

export type SkType = typeof SK_TYPES[number];

export const SK_LABELS: Record<SkType, string> = {
  SK_PMB_RPL: "SK Penerimaan Mahasiswa Baru RPL",
  SK_PEDOMAN_INSTITUSI: "SK Pedoman Penyelenggaraan RPL Institusi",
  SK_PEDOMAN_PRODI: "SK Pedoman Penyelenggaraan RPL Program Studi",
  SK_PENGELOLA_RPL: "SK Tim Pengelola RPL",
  SK_PENILAI_RPL: "SK Penilai RPL",
  SK_PENUGASAN_PENILAI: "SK Penugasan Penilai RPL",
  BA_PLENO: "Berita Acara Pleno Hasil RPL",
  SK_HASIL_RPL: "SK Penetapan Hasil RPL"
};

export const CHECKLIST_AWAL_PERIODE: SkType[] = [
  "SK_PMB_RPL",
  "SK_PEDOMAN_INSTITUSI",
  "SK_PEDOMAN_PRODI",
  "SK_PENGELOLA_RPL",
  "SK_PENILAI_RPL"
];

export function generateSkNumberAwal(): string {
  // Return "-" so admin is forced to replace it
  return "-";
}

export function getDefaultTitle(skType: SkType, year: string | number): string {
  const base = SK_LABELS[skType];
  return `${base} Tahun Akademik ${year}`;
}

export function getDefaultKonsideran(skType: SkType): string[] {
  switch (skType) {
    case "SK_PMB_RPL":
      return [
        "Bahwa untuk memberikan kesempatan belajar seluas-luasnya, perlu diselenggarakan Rekognisi Pembelajaran Lampau (RPL).",
        "Bahwa pendaftaran mahasiswa baru jalur RPL perlu ditetapkan dengan Surat Keputusan."
      ];
    case "SK_PEDOMAN_INSTITUSI":
      return [
        "Bahwa penyelenggaraan RPL memerlukan pedoman di tingkat institusi agar terstandarisasi dan menjamin mutu akademik."
      ];
    case "SK_PENGELOLA_RPL":
      return [
        "Bahwa untuk kelancaran pelaksanaan RPL, dipandang perlu untuk membentuk Tim Pengelola RPL.",
        "Bahwa nama-nama yang tercantum dalam lampiran keputusan ini dinilai cakap dan memenuhi syarat."
      ];
    case "SK_PENILAI_RPL":
      return [
        "Bahwa untuk menjamin mutu dan akuntabilitas asesmen portofolio RPL, perlu ditetapkan Penilai yang berkompeten.",
        "Bahwa nama-nama yang tercantum dalam lampiran keputusan ini dinilai memenuhi syarat kepakaran."
      ];
    default:
      return ["Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menetapkan Surat Keputusan."];
  }
}

export function getDefaultDasarHukum(skType: SkType): string[] {
  return [
    "Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.",
    "Undang-Undang Nomor 12 Tahun 2012 tentang Pendidikan Tinggi.",
    "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 41 Tahun 2021 tentang Rekognisi Pembelajaran Lampau."
  ];
}

export function getDefaultDiktum(skType: SkType): string[] {
  switch (skType) {
    case "SK_PMB_RPL":
      return [
        "KESATU: Menetapkan Pembukaan Penerimaan Mahasiswa Baru Jalur Rekognisi Pembelajaran Lampau.",
        "KEDUA: Keputusan ini berlaku sejak tanggal ditetapkan."
      ];
    case "SK_PENGELOLA_RPL":
      return [
        "KESATU: Mengangkat Tim Pengelola Rekognisi Pembelajaran Lampau sebagaimana tercantum dalam lampiran.",
        "KEDUA: Tim Pengelola bertugas menyelenggarakan, memonitor, dan mengevaluasi kegiatan RPL."
      ];
    case "SK_PENILAI_RPL":
      return [
        "KESATU: Mengangkat Tim Penilai Rekognisi Pembelajaran Lampau sebagaimana tercantum dalam lampiran.",
        "KEDUA: Penilai bertugas melakukan evaluasi, validasi, dan penilaian dokumen portofolio pelamar RPL."
      ];
    default:
      return [
        "KESATU: Menetapkan ...",
        "KEDUA: Keputusan ini mulai berlaku pada tanggal ditetapkan dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya."
      ];
  }
}
