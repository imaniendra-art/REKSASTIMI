"use client";

import type { FinanceSettingsData } from "@/lib/finance-settings";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { compressImageIfNeeded } from "@/lib/image-compressor";

type PaymentHistory = {
  _id: string;
  jenisPembayaran: string;
  tanggalBayar: string;
  nominal: number;
  keterangan?: string;
  statusVerifikasi: "Proses" | "Diterima" | "Ditolak";
  catatanAdmin?: string;
  buktiBayar?: string;
};

type KeuanganClientProps = {
  histori: PaymentHistory[];
  isRegistrationAccepted: boolean;
  pendingRegistrationPayment?: { tanggalBayar: string; nominal: number; createdAt: string } | null;
  rejectedRegistrationPayment?: { catatanAdmin: string; tanggalBayar: string } | null;
  settings?: FinanceSettingsData;
};

function StatusBadge({ status }: { status: PaymentHistory["statusVerifikasi"] }) {
  const style =
    status === "Diterima"
      ? { background: "var(--md-success-container)", color: "var(--md-success)", border: "1px solid #a7f3d0" }
      : status === "Ditolak"
        ? { background: "var(--md-error-container)", color: "var(--md-error)", border: "1px solid #fecaca" }
        : { background: "var(--md-warning-container)", color: "var(--md-warning)", border: "1px solid #fde68a" };

  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 800 }}>
      <span>{status === "Diterima" ? "✓" : status === "Ditolak" ? "✕" : "⏳"}</span>
      <span>{status}</span>
    </span>
  );
}

export default function KeuanganClient({
  histori,
  isRegistrationAccepted,
  pendingRegistrationPayment,
  rejectedRegistrationPayment,
  settings,
}: KeuanganClientProps) {
  const bankName = settings?.bankName || "Bank BRI";
  const accountNumber = settings?.accountNumber || "3419-0106-7835-533";
  const accountHolder = settings?.accountHolder || "Sekolah Tinggi Ilmu Manajemen Indonesia (RPL)";
  const registrationFee = settings?.registrationFee || 250000;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);

  // Form states
  const [jenis, setJenis] = useState(isRegistrationAccepted ? "Biaya Asesmen RPL" : "Biaya Pendaftaran RPL");
  const [nominal, setNominal] = useState(isRegistrationAccepted ? "500000" : String(registrationFee));
  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().split("T")[0]);
  const [keterangan, setKeterangan] = useState("");

  // File Objects
  const [fileBukti, setFileBukti] = useState<File | null>(null);
  const [fileKtp, setFileKtp] = useState<File | null>(null);
  const [fileKk, setFileKk] = useState<File | null>(null);
  const [fileAkta, setFileAkta] = useState<File | null>(null);
  const [fileIjazah, setFileIjazah] = useState<File | null>(null);

  const isPendaftaran = !isRegistrationAccepted || jenis.toLowerCase().includes("pendaftaran");

  // Copy bank account number
  const handleCopyRekening = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber.replace(/\D/g, "") || "341901067835533");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Client-side validations
    if (!fileBukti) {
      setMessage({ type: "error", text: "File bukti pembayaran transfer bank wajib diunggah." });
      return;
    }

    if (isPendaftaran) {
      if (!fileKtp) {
        setMessage({ type: "error", text: "Foto / Scan KTP Asli wajib diunggah." });
        return;
      }
      if (!fileKk) {
        setMessage({ type: "error", text: "Foto / Scan Kartu Keluarga (KK) wajib diunggah." });
        return;
      }
      if (!fileAkta) {
        setMessage({ type: "error", text: "Foto / Scan Akta Kelahiran wajib diunggah." });
        return;
      }
      if (!fileIjazah) {
        setMessage({ type: "error", text: "Foto / Scan Ijazah SMA/Sederajat wajib diunggah." });
        return;
      }
    }

    setLoading(true);
    setCompressing(true);

    try {
      const formData = new FormData();
      formData.set("jenis", isRegistrationAccepted ? jenis : "Biaya Pendaftaran RPL");
      formData.set("tanggal_bayar", tanggalBayar);
      formData.set("nominal", isRegistrationAccepted ? nominal : "250000");
      formData.set("keterangan", keterangan);

      // Smart auto-resize compression before uploading
      if (fileBukti) {
        const compressed = await compressImageIfNeeded(fileBukti);
        formData.set("bukti", compressed);
      }
      if (fileKtp) {
        const compressed = await compressImageIfNeeded(fileKtp);
        formData.set("file_ktp", compressed);
      }
      if (fileKk) {
        const compressed = await compressImageIfNeeded(fileKk);
        formData.set("file_kk", compressed);
      }
      if (fileAkta) {
        const compressed = await compressImageIfNeeded(fileAkta);
        formData.set("file_akta", compressed);
      }
      if (fileIjazah) {
        const compressed = await compressImageIfNeeded(fileIjazah);
        formData.set("file_ijazah", compressed);
      }

      setCompressing(false);

      const response = await fetch("/api/mahasiswa/keuangan/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({
        success: false,
        error: `Gagal membaca respons server (kode status: ${response.status}).`,
      }));

      if (result.success) {
        setMessage({
          type: "success",
          text: "Foto berhasil dioptimalkan dan berkas pendaftaran berhasil dikirim. Menunggu verifikasi tim keuangan.",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 6000);
        e.currentTarget.reset();
        setFileBukti(null);
        setFileKtp(null);
        setFileKk(null);
        setFileAkta(null);
        setFileIjazah(null);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Terjadi kesalahan saat mengunggah berkas." });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Gagal mengompresi atau mengunggah berkas." });
    } finally {
      setLoading(false);
      setCompressing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* ── Bagian Atas: Grid Asimetris 65 : 35 (Form Kiri & Rekening/Helpdesk Kanan) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── Kolom Kiri (~65%): Form Pembayaran Pendaftaran / Lanjutan ── */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {/* Peringatan Status Gated Funnel Sebelum Pendaftaran Diterima */}
          {!isRegistrationAccepted && (
            <div
              style={{
                borderRadius: 16,
                padding: "16px 20px",
                background: pendingRegistrationPayment
                  ? "var(--md-warning-container)"
                  : rejectedRegistrationPayment
                  ? "var(--md-error-container)"
                  : "var(--md-surface-2)",
                border: pendingRegistrationPayment
                  ? "1.5px solid var(--md-warning)"
                  : rejectedRegistrationPayment
                  ? "1.5px solid var(--md-error)"
                  : "1.5px solid var(--md-primary)",
                color: pendingRegistrationPayment
                  ? "var(--md-warning)"
                  : rejectedRegistrationPayment
                  ? "var(--md-error)"
                  : "var(--md-on-surface)",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>
                {pendingRegistrationPayment ? "⏳" : rejectedRegistrationPayment ? "⚠️" : "🔒"}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
                  {pendingRegistrationPayment
                    ? "Pembayaran Pendaftaran Sedang Diverifikasi"
                    : rejectedRegistrationPayment
                    ? "Pembayaran Pendaftaran Ditolak"
                    : "Langkah Wajib: Selesaikan Pembayaran Pendaftaran"}
                </h4>
                <p style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: 1.5, opacity: 0.9 }}>
                  {pendingRegistrationPayment
                    ? "Bukti transfer dan 4 berkas pendaftaran Anda telah diterima sistem dan sedang dalam antrean verifikasi Tim Keuangan (Pak Riswan). Seluruh menu akademik akan otomatis terbuka setelah diverifikasi."
                    : rejectedRegistrationPayment
                    ? `Alasan penolakan: ${rejectedRegistrationPayment.catatanAdmin || "Bukti bayar tidak sesuai / tidak terbaca."}. Silakan perbaiki dan kirim ulang bukti bayar serta berkas legalitas di bawah ini.`
                    : "Seluruh menu akademik di sidebar (Biodata, CV, Form F02, Asesmen Mandiri, Form F03, dan Pusat Download) terkunci. Silakan transfer biaya registrasi Rp 250.000 ke rekening resmi BRI di samping, lalu unggah bukti transfer dan 4 berkas legalitas pendaftar di bawah ini."}
                </p>
              </div>
            </div>
          )}

          {isRegistrationAccepted && (
            <div
              style={{
                borderRadius: 16,
                padding: "14px 18px",
                background: "var(--md-success-container)",
                border: "1.5px solid var(--md-success)",
                color: "var(--md-success)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 900 }}>
                  Pembayaran Pendaftaran RPL Terverifikasi
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.9 }}>
                  Seluruh akses akademik Anda telah aktif. Form di bawah ini dapat digunakan jika ada tagihan administrasi lanjutan.
                </p>
              </div>
            </div>
          )}

          <div className="md-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)" }}>
              <p style={{ color: "var(--md-primary)", fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {!isRegistrationAccepted ? "Formulir Pendaftaran Khusus" : "Formulir Transaksi Lanjutan"}
              </p>
              <h2 style={{ marginTop: 4, color: "var(--md-on-surface)", fontSize: 18, fontWeight: 900 }}>
                {!isRegistrationAccepted ? "Konfirmasi Bayar Pendaftaran & Upload 4 Berkas Legalitas" : "Konfirmasi Pembayaran Transaksi"}
              </h2>
              <p style={{ marginTop: 4, color: "var(--md-on-surface-variant)", fontSize: 12.5, fontWeight: 500, lineHeight: 1.5 }}>
                {!isRegistrationAccepted
                  ? "Kirim bukti transfer biaya registrasi Rp 250.000 beserta scan KTP, Kartu Keluarga, Akta Kelahiran, dan Ijazah SMA/Sederajat (Foto otomatis di-resize & nama distandarisasi)."
                  : "Unggah bukti pembayaran bank untuk jenis transaksi administrasi yang Anda pilih."}
              </p>
            </div>

            <div style={{ padding: "22px 24px" }}>
              {message.text && (
                <div
                  style={{
                    marginBottom: 18,
                    borderRadius: 12,
                    border: message.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5",
                    background: message.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
                    color: message.type === "success" ? "var(--md-success)" : "var(--md-error)",
                    padding: "14px 16px",
                    fontSize: 12.5,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{message.type === "success" ? "✅" : "⚠️"}</span>
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                
                {/* ── Field Khusus Pendaftar Baru vs Mahasiswa Lunas ── */}
                {!isRegistrationAccepted ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>
                        Jenis Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <input type="hidden" name="jenis" value="Biaya Pendaftaran RPL" />
                      <div
                        style={{
                          minHeight: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0 14px",
                          borderRadius: 12,
                          background: "var(--md-primary-container)",
                          color: "var(--md-on-primary-container)",
                          fontWeight: 800,
                          fontSize: 13,
                          border: "1px solid var(--md-primary)",
                        }}
                      >
                        <span>Biaya Pendaftaran RPL</span>
                        <span style={{ fontSize: 10, background: "var(--md-primary)", color: "#fff", padding: "2px 8px", borderRadius: 999 }}>
                          Wajib
                        </span>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Tarif Biaya Registrasi <span className="text-red-500">*</span>
                      </label>
                      <input type="hidden" name="nominal" value="250000" />
                      <div
                        style={{
                          minHeight: 44,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 14px",
                          borderRadius: 12,
                          background: "var(--md-surface-2)",
                          color: "var(--md-on-surface)",
                          fontWeight: 900,
                          fontSize: 14,
                          border: "1px solid var(--md-outline-variant)",
                        }}
                      >
                        Rp 250.000 <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "var(--md-on-surface-variant)" }}>(Tarif Standar RPL)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>
                        Jenis Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jenis"
                        required
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value)}
                        style={fieldStyle}
                      >
                        <option value="Biaya Asesmen RPL">Biaya Asesmen RPL</option>
                        <option value="Pembayaran Cicilan RPL">Pembayaran Cicilan RPL</option>
                        <option value="Pembayaran Pelunasan RPL">Pembayaran Pelunasan RPL</option>
                        <option value="Pembayaran Jurnal / Skripsi">Pembayaran Jurnal / Skripsi</option>
                        <option value="Pembayaran Wisuda">Pembayaran Wisuda</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Nominal Transfer (Rp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="nominal"
                        required
                        value={nominal}
                        onChange={(e) => setNominal(e.target.value)}
                        placeholder="Contoh: 500000"
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tanggal Transfer */}
                  <div>
                    <label style={labelStyle}>
                      Tanggal Transfer Bank <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal_bayar"
                      required
                      value={tanggalBayar}
                      onChange={(e) => setTanggalBayar(e.target.value)}
                      style={fieldStyle}
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label style={labelStyle}>
                      Keterangan / Nama Pemilik Rekening Pengirim
                    </label>
                    <input
                      type="text"
                      name="keterangan"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Transfer via BRI Mobile a.n Ahmad"
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {/* ── Box Upload Bukti Transfer ── */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      1. Bukti Transfer Bank (Resi / Struk / Screenshot BRI Mobile) <span className="text-red-500">*</span>
                    </label>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--md-primary)" }}>
                      Format Otomatis: pendaftaran_nama.ext
                    </span>
                  </div>
                  <div
                    style={{
                      border: fileBukti ? "1.5px solid var(--md-primary)" : "1.5px dashed var(--md-outline)",
                      borderRadius: 14,
                      background: "var(--md-surface-2)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        🧾
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)" }}>
                          {fileBukti ? fileBukti.name : "Pilih file struk bukti transfer"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--md-on-surface-variant)" }}>
                          {fileBukti ? `Ukuran: ${(fileBukti.size / 1024).toFixed(0)} KB (akan di-resize otomatis jika foto besar)` : "Format didukung: JPG, PNG, atau PDF"}
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="bukti-pembayaran"
                      style={{
                        padding: "9px 18px",
                        borderRadius: 999,
                        background: "var(--md-primary)",
                        color: "var(--md-on-primary)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px var(--theme-glow)",
                      }}
                    >
                      <span>📁</span>
                      <span>{fileBukti ? "Ganti File" : "Pilih Bukti Transfer"}</span>
                    </label>
                    <input
                      id="bukti-pembayaran"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      required={!isRegistrationAccepted}
                      onChange={(e) => setFileBukti(e.currentTarget.files?.[0] || null)}
                      style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
                    />
                  </div>
                </div>

                {/* ── Dokumen Wajib Calon Mahasiswa (Wajib Pendaftaran) ── */}
                {isPendaftaran && (
                  <div style={{ marginTop: 6, padding: "16px 18px", borderRadius: 16, background: "var(--md-surface-2)", border: "1px solid var(--md-outline-variant)" }}>
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ color: "var(--md-primary)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                        <span>📋</span>
                        <span>4 Berkas Legalitas Wajib Calon Mahasiswa (Auto-Resize & Penamaan Otomatis)</span>
                      </p>
                      <p style={{ color: "var(--md-on-surface-variant)", fontSize: 11.5, marginTop: 4, lineHeight: 1.5 }}>
                        Foto dokumen besar otomatis di-resize maksimal 1600px dan disimpan dengan format: <code>ktp_nama</code>, <code>kk_nama</code>, <code>akta_nama</code>, <code>ijazah_nama</code>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Foto KTP */}
                      <div style={{ padding: "10px 12px", background: "var(--md-surface-1)", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>🪪 KTP Asli <span className="text-red-500">*</span></span>
                          {fileKtp && <span style={{ fontSize: 10, fontWeight: 900, color: "var(--md-primary)" }}>✓ Terpilih</span>}
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          required={isPendaftaran}
                          onChange={(e) => setFileKtp(e.currentTarget.files?.[0] || null)}
                          style={{ ...fieldStyle, minHeight: 36, padding: "6px 10px", fontSize: 11 }}
                        />
                        <span style={{ fontSize: 9.5, color: "var(--md-on-surface-variant)", display: "block", marginTop: 4 }}>
                          Simpan sebagai: <strong>ktp_nama</strong>
                        </span>
                      </div>

                      {/* Foto KK */}
                      <div style={{ padding: "10px 12px", background: "var(--md-surface-1)", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>👨‍👩‍👧‍👦 Kartu Keluarga (KK) <span className="text-red-500">*</span></span>
                          {fileKk && <span style={{ fontSize: 10, fontWeight: 900, color: "var(--md-primary)" }}>✓ Terpilih</span>}
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          required={isPendaftaran}
                          onChange={(e) => setFileKk(e.currentTarget.files?.[0] || null)}
                          style={{ ...fieldStyle, minHeight: 36, padding: "6px 10px", fontSize: 11 }}
                        />
                        <span style={{ fontSize: 9.5, color: "var(--md-on-surface-variant)", display: "block", marginTop: 4 }}>
                          Simpan sebagai: <strong>kk_nama</strong>
                        </span>
                      </div>

                      {/* Foto Akta Kelahiran */}
                      <div style={{ padding: "10px 12px", background: "var(--md-surface-1)", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>📜 Akta Kelahiran <span className="text-red-500">*</span></span>
                          {fileAkta && <span style={{ fontSize: 10, fontWeight: 900, color: "var(--md-primary)" }}>✓ Terpilih</span>}
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          required={isPendaftaran}
                          onChange={(e) => setFileAkta(e.currentTarget.files?.[0] || null)}
                          style={{ ...fieldStyle, minHeight: 36, padding: "6px 10px", fontSize: 11 }}
                        />
                        <span style={{ fontSize: 9.5, color: "var(--md-on-surface-variant)", display: "block", marginTop: 4 }}>
                          Simpan sebagai: <strong>akta_nama</strong>
                        </span>
                      </div>

                      {/* Foto Ijazah SMA */}
                      <div style={{ padding: "10px 12px", background: "var(--md-surface-1)", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>🎓 Ijazah SMA/Sederajat <span className="text-red-500">*</span></span>
                          {fileIjazah && <span style={{ fontSize: 10, fontWeight: 900, color: "var(--md-primary)" }}>✓ Terpilih</span>}
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          required={isPendaftaran}
                          onChange={(e) => setFileIjazah(e.currentTarget.files?.[0] || null)}
                          style={{ ...fieldStyle, minHeight: 36, padding: "6px 10px", fontSize: 11 }}
                        />
                        <span style={{ fontSize: 9.5, color: "var(--md-on-surface-variant)", display: "block", marginTop: 4 }}>
                          Simpan sebagai: <strong>ijazah_nama</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tombol Submit CTA Utama */}
                <button
                  type="submit"
                  disabled={loading || compressing}
                  style={{
                    minHeight: 48,
                    marginTop: 4,
                    border: 0,
                    borderRadius: 999,
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    cursor: loading || compressing ? "wait" : "pointer",
                    boxShadow: "0 4px 14px var(--theme-glow)",
                    fontSize: 13,
                    fontWeight: 900,
                    opacity: loading || compressing ? 0.75 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.18s ease",
                  }}
                >
                  <span>
                    {compressing
                      ? "Mengompresi & Mengoptimalkan Foto..."
                      : loading
                      ? "Mengunggah Berkas ke Server..."
                      : !isRegistrationAccepted
                      ? "Kirim Bukti Bayar & 4 Berkas Pendaftaran"
                      : "Kirim Konfirmasi Pembayaran"}
                  </span>
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Kolom Kanan (~35%): Rekening Resmi BRI & Helpdesk Riswan ── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          
          {/* 1. Kartu Rekening Resmi BRI */}
          <div
            className="md-card"
            style={{
              padding: "22px 20px",
              background: "linear-gradient(135deg, var(--md-surface-1) 0%, var(--md-surface-2) 100%)",
              border: "1.5px solid var(--md-primary)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--md-primary-container)",
                  color: "var(--md-primary)",
                }}
              >
                Rekening Resmi RPL
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: "var(--md-on-surface)" }}>
                {bankName}
              </span>
            </div>

            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Nomor Rekening Tujuan
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "2px 0 6px" }}>
              <span style={{ fontSize: 20, fontWeight: 950, letterSpacing: "0.03em", fontFamily: "monospace", color: "var(--md-on-surface)" }}>
                {accountNumber}
              </span>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
              A.n <strong style={{ color: "var(--md-on-surface)" }}>{accountHolder}</strong>
            </p>

            <button
              onClick={handleCopyRekening}
              type="button"
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 999,
                border: "1px solid var(--md-primary)",
                background: copied ? "var(--md-primary)" : "var(--md-surface-1)",
                color: copied ? "var(--md-on-primary)" : "var(--md-primary)",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.18s ease",
              }}
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Nomor Rekening Tersalin!" : `Salin Nomor Rekening ${bankName}`}</span>
            </button>
          </div>

          {/* 2. Kartu Panduan Alur Verifikasi */}
          <div className="md-card" style={{ padding: "18px 20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 900, color: "var(--md-on-surface)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>ℹ️</span>
              <span>Alur Verifikasi Pendaftaran</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { step: "1", title: "Transfer Rp 250.000 ke BRI", desc: "Pastikan transfer ke nomor rekening resmi BRI STIMI di atas." },
                { step: "2", title: "Unggah Bukti & 4 Berkas", desc: "Foto otomatis di-resize tajam & dinamai pendaftaran_nama, ktp_nama, dst." },
                { step: "3", title: "Verifikasi Bagian Keuangan", desc: "Admin memvalidasi transaksi dalam 1x24 jam kerja untuk membuka akses akademik." },
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--md-primary-container)", color: "var(--md-primary)", fontSize: 10.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {item.step}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)" }}>{item.title}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Kartu Kontak WhatsApp Helpdesk Keuangan Riswan */}
          <div
            className="md-card"
            style={{
              padding: "18px 20px",
              background: "var(--md-surface-1)",
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "#25D366",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                💬
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Helpdesk Keuangan RPL
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--md-on-surface-variant)", fontWeight: 650 }}>
                  Riswan (+62 851-7448-9071)
                </p>
              </div>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "var(--md-on-surface-variant)", lineHeight: 1.45 }}>
              Memiliki kendala transfer atau membutuhkan konfirmasi segera? Hubungi admin keuangan via WhatsApp.
            </p>
            <a
              href="https://wa.me/6285174489071?text=Halo%20Pak%20Riswan%20(Keuangan%20STIMI),%20saya%20calon%20mahasiswa%20RPL%20ingin%20konfirmasi%20pembayaran%20pendaftaran."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 999,
                background: "#25D366",
                color: "#fff",
                fontSize: 12,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 2px 10px rgba(37, 211, 102, 0.25)",
              }}
            >
              <span>Chat WhatsApp Pak Riswan</span>
              <span>↗</span>
            </a>
          </div>

        </div>
      </div>

      {/* ── Bagian Bawah: Riwayat Transaksi Full Width (100% Lebar Layar) ── */}
      <div className="md-card" style={{ overflow: "hidden", width: "100%" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ color: "var(--md-primary)", fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Histori
            </p>
            <h2 style={{ marginTop: 2, color: "var(--md-on-surface)", fontSize: 17, fontWeight: 900 }}>
              Riwayat Transaksi & Status Validasi
            </h2>
          </div>
          <span style={{ borderRadius: 999, background: "var(--md-surface-1)", color: "var(--md-on-surface-variant)", border: "1px solid var(--md-outline-variant)", padding: "5px 12px", fontSize: 11, fontWeight: 900 }}>
            {histori.length} Transaksi Tercatat
          </span>
        </div>

        {histori.length === 0 ? (
          <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <div style={{ maxWidth: 380, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 12px", borderRadius: 16, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 }}>
                💳
              </div>
              <p style={{ color: "var(--md-on-surface)", fontSize: 15, fontWeight: 900, margin: 0 }}>
                Belum Ada Riwayat Transaksi
              </p>
              <p style={{ marginTop: 6, color: "var(--md-on-surface-variant)", fontSize: 12, lineHeight: 1.55 }}>
                Setelah Anda mengirimkan konfirmasi pembayaran pendaftaran di atas, riwayat status dan catatan verifikasi keuangan akan tampil di sini.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
                  {["Tanggal", "Jenis Pembayaran & Keterangan", "Nominal", "Bukti Resi", "Status Validasi"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 18px", color: "var(--md-on-surface-variant)", fontSize: 10.5, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {histori.map((h) => (
                  <tr key={h._id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {new Date(h.tanggalBayar).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ color: "var(--md-primary)", fontSize: 12.5, fontWeight: 900 }}>{h.jenisPembayaran}</div>
                      <div style={{ marginTop: 2, color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 600 }}>{h.keterangan || "-"}</div>
                      {h.statusVerifikasi === "Ditolak" && h.catatanAdmin && (
                        <div style={{ marginTop: 8, borderRadius: 10, border: "1px solid #fecaca", background: "var(--md-error-container)", padding: "6px 10px" }}>
                          <span style={{ color: "var(--md-error)", fontSize: 10, fontWeight: 800 }}>Alasan Penolakan: </span>
                          <span style={{ color: "var(--md-error)", fontSize: 11 }}>{h.catatanAdmin}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--md-on-surface)", fontSize: 13, fontWeight: 900, whiteSpace: "nowrap" }}>
                      Rp {Number(h.nominal || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      {h.buktiBayar ? (
                        <a
                          href={h.buktiBayar}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            color: "var(--md-primary)",
                            textDecoration: "none",
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "var(--md-primary-container)",
                          }}
                        >
                          <span>Lihat File</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--md-on-surface-variant)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      <StatusBadge status={h.statusVerifikasi} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  color: "var(--md-on-surface-variant)",
  fontSize: 10.5,
  fontWeight: 900,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  background: "var(--md-surface-2)",
  color: "var(--md-on-surface)",
  padding: "0 13px",
  outline: "none",
  fontSize: 13,
  fontWeight: 600,
};
