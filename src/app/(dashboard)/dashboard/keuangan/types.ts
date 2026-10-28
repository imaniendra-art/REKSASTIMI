export type FinancePaymentRow = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  registrationNumber: string;
  periodName: string;
  jenisPembayaran: string;
  tanggalBayar: string;
  nominal: number;
  keterangan: string;
  buktiBayar: string;
  statusVerifikasi: "Proses" | "Diterima" | "Ditolak";
  catatanAdmin: string;
  createdAt: string;
};

export type FinanceAnalytics = {
  totalDanaMasuk: number;
  totalPendaftaranNominal: number;
  totalPendaftaranCount: number;
  totalAsesmenNominal: number;
  totalAsesmenCount: number;
  totalLainnyaNominal: number;
  totalLainnyaCount: number;
  totalPendingCount: number;
  totalAcceptedCount: number;
  totalRejectedCount: number;
  totalPendaftar: number;
  pendaftarLunasCount: number;
  pendaftarBelumLunasCount: number;
  namaPeriodeAktif: string;
  monthlyTrends: Array<{
    monthKey: string;
    label: string;
    total: number;
    count: number;
  }>;
};

export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
