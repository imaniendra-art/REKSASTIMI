export const JENIS_BUKTI_F03 = [
  { id: 1, label: "Ijazah/Transkrip" },
  { id: 2, label: "Riwayat Pekerjaan" },
  { id: 3, label: "Sertifikat Kompetensi" },
  { id: 4, label: "Sertifikat Lisensi" },
  { id: 5, label: "Foto Pekerjaan" },
  { id: 6, label: "Buku Harian" },
  { id: 7, label: "Lembar Kerja" },
  { id: 8, label: "Dokumen Analisis" },
  { id: 9, label: "Logbook" },
  { id: 10, label: "Catatan Pelatihan" },
  { id: 11, label: "Keanggotaan Asosiasi" },
  { id: 12, label: "Surat Referensi" },
  { id: 13, label: "Penghargaan" },
  { id: 14, label: "Penilaian Kinerja" },
  { id: 15, label: "Dokumen lain" },
];

export const TINGKAT_KEMAMPUAN_F03 = [
  "Sangat Baik",
  "Baik",
  "Cukup",
  "Kurang",
];

export const isAttemptCompleted = (attempt: any): boolean => {
  if (!attempt) return false;
  
  const isStatusCompleted = attempt.status === "Completed" || attempt.status === "COMPLETED" || attempt.status === "completed";
  const hasCertificate = !!attempt.certificateNumber;
  const isCompletedFlag = attempt.isCompleted === true;
  const hasCompletedAt = !!attempt.completedAt;

  return isStatusCompleted || hasCertificate || isCompletedFlag || hasCompletedAt;
};
