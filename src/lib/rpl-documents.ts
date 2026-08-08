export const DOCUMENT_TYPES = [
  "F01",
  "F02",
  "F03",
  "F04",
  "F05",
  "F07",
  "SANGGAHAN",
  "BA_PLENO",
  "SK_HASIL",
  "LAMPIRAN_KONVERSI",
  "BUNDLE"
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  "F01": "F01 - Petunjuk Pemohon",
  "F02": "F02 - Aplikasi Asesmen RPL",
  "F03": "F03 - Evaluasi Diri & VATM",
  "F04": "F04 - Biodata Penilai Akademisi",
  "F05": "F05 - Biodata Penilai Praktisi",
  "F07": "F07 - Daftar Riwayat Hidup",
  "SANGGAHAN": "Surat Pernyataan Sanggahan",
  "BA_PLENO": "Berita Acara Pleno",
  "SK_HASIL": "SK Penetapan Hasil",
  "LAMPIRAN_KONVERSI": "Lampiran Hasil Konversi",
  "BUNDLE": "Bundle Dokumen RPL"
};

export function generateDocumentNumber(
  type: DocumentType,
  year: string | number,
  noReg: string,
  extra: string = ""
): string {
  const romanMonth = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()];
  
  switch (type) {
    case "F02":
      return `F02/REKSA/STIMI/${year}/${noReg}`;
    case "F03":
      return `F03/REKSA/STIMI/${year}/${noReg}${extra ? `/${extra}` : ""}`;
    case "SANGGAHAN":
      return `SANGGAHAN/REKSA/STIMI/${year}/${noReg}`;
    case "BA_PLENO":
      return `BA-PLENO/REKSA-STIMI/${romanMonth}/${year}`;
    case "SK_HASIL":
      return `SK-HASIL/REKSA-STIMI/${romanMonth}/${year}`;
    case "LAMPIRAN_KONVERSI":
      return `KONV/REKSA/STIMI/${year}/${noReg}`;
    case "BUNDLE":
      return `BUNDLE/REKSA/STIMI/${year}/${noReg}`;
    default:
      return `${type}/REKSA/STIMI/${year}/${noReg}`;
  }
}

export function checkReadiness(
  type: DocumentType,
  studentProfile: any,
  f02Exists: boolean,
  f03Valid: boolean,
  penilaiProfilesExist: boolean,
  sanggahanAccepted: boolean,
  finalResultStatus: string | null,
  allRequiredDocsReady: boolean = false
): { isReady: boolean; reason: string } {
  
  switch (type) {
    case "F01":
      return { isReady: true, reason: "Template panduan selalu siap cetak." };
    
    case "F02":
      if (studentProfile && f02Exists) return { isReady: true, reason: "Data aplikasi lengkap." };
      return { isReady: false, reason: "Mahasiswa belum mengisi biodata atau F02 lengkap." };
      
    case "F03":
      if (f03Valid) return { isReady: true, reason: "Hasil penilaian telah dikonfirmasi." };
      return { isReady: false, reason: "Belum dikonfirmasi atau F03 belum lengkap dinilai." };
      
    case "F04":
    case "F05":
      if (penilaiProfilesExist) return { isReady: true, reason: "Profil penilai tersedia." };
      return { isReady: false, reason: "Data profil penilai yang terkait belum lengkap." };
      
    case "SANGGAHAN":
      if (sanggahanAccepted) return { isReady: true, reason: "Mahasiswa telah menerima/mengajukan sanggahan." };
      return { isReady: false, reason: "Butuh data tambahan: konfirmasi penerimaan/sanggahan mahasiswa." };
      
    case "BA_PLENO":
    case "SK_HASIL":
    case "LAMPIRAN_KONVERSI":
      if (finalResultStatus === "FINAL") return { isReady: true, reason: "Hasil akhir telah difinalisasi." };
      return { isReady: false, reason: "Belum Siap: hasil konversi final belum dibuat." };
      
    case "BUNDLE":
      if (allRequiredDocsReady) return { isReady: true, reason: "Seluruh dokumen komponen telah siap." };
      return { isReady: false, reason: "Belum bisa di-bundle karena ada dokumen wajib yang belum siap." };
      
    default:
      return { isReady: false, reason: "Tipe dokumen tidak dikenali." };
  }
}
