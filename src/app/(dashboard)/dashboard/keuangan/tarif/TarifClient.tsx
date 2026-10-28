"use client";

import { useState, useTransition } from "react";
import type { FinanceSettingsData } from "@/lib/finance-settings";
import { formatRupiah } from "../types";
import { updateFinanceSettingsAction } from "./actions";

type TarifClientProps = {
  initialSettings: FinanceSettingsData;
};

export function TarifClient({ initialSettings }: TarifClientProps) {
  const [settings, setSettings] = useState<FinanceSettingsData>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateFinanceSettingsAction(formData);
        setSettings({
          registrationFee: Number(formData.get("registrationFee")),
          assessmentFee: Number(formData.get("assessmentFee")),
          bankName: String(formData.get("bankName")),
          accountNumber: String(formData.get("accountNumber")),
          accountHolder: String(formData.get("accountHolder")),
          treasurerName: String(formData.get("treasurerName")),
          institutionName: String(formData.get("institutionName")),
        });
        setStatusMessage({ type: "success", text: "✓ Pengaturan tarif dan rekening kampus berhasil disimpan dan langsung aktif!" });
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Gagal menyimpan pengaturan." });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {statusMessage && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            background: statusMessage.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
            color: statusMessage.type === "success" ? "var(--md-success)" : "var(--md-error)",
            border: statusMessage.type === "success" ? "1px solid #a7f3d0" : "1px solid #fecaca",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{statusMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── FORM PENGATURAN (7 Kolom) ── */}
        <div className="lg:col-span-7 md-card" style={{ padding: "24px 26px" }}>
          <div style={{ marginBottom: 20, borderBottom: "1px solid var(--md-outline-variant)", paddingBottom: 14 }}>
            <h3 style={{ margin: 0, color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>
              Konfigurasi Master Keuangan Kampus
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--md-on-surface-variant)", fontSize: 11.5, fontWeight: 650 }}>
              Perubahan pada data ini akan langsung mempengaruhi petunjuk transfer di akun calon mahasiswa.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* 1. Biaya Pendaftaran */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Biaya Pendaftaran RPL (Rp) <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                type="number"
                name="registrationFee"
                defaultValue={settings.registrationFee}
                required
                min={0}
                step={50000}
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 10.5, color: "var(--md-on-surface-variant)", marginTop: 4, display: "block" }}>
                Nominal baku yang harus ditransfer calon pendaftar pada tahap awal.
              </span>
            </div>

            {/* 2. Biaya Asesmen */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Biaya Asesmen RPL / SKS (Rp)
              </label>
              <input
                type="number"
                name="assessmentFee"
                defaultValue={settings.assessmentFee}
                min={0}
                step={25000}
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 10.5, color: "var(--md-on-surface-variant)", marginTop: 4, display: "block" }}>
                Isi 0 jika biaya asesmen sudah terintegrasi gratis dalam paket pendaftaran.
              </span>
            </div>

            {/* 3. Nama Bank */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Nama Bank Penerima <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                type="text"
                name="bankName"
                defaultValue={settings.bankName}
                required
                placeholder="Contoh: Bank Rakyat Indonesia (BRI)"
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
            </div>

            {/* 4. Nomor Rekening */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Nomor Rekening Bank <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                defaultValue={settings.accountNumber}
                required
                placeholder="Contoh: 3419-0106-7835-533"
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 850,
                  letterSpacing: "0.05em",
                  fontVariantNumeric: "tabular-nums",
                  outline: "none",
                }}
              />
            </div>

            {/* 5. Atas Nama Rekening */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Atas Nama Rekening (Pemilik Akun Bank) <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                type="text"
                name="accountHolder"
                defaultValue={settings.accountHolder}
                required
                placeholder="Contoh: RPL STIMI YAPMI Makassar"
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 750,
                  outline: "none",
                }}
              />
            </div>

            {/* 6. Nama Bendahara (Untuk Kuitansi) */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Nama Bendahara Keuangan (Tanda Tangan Kuitansi) <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                type="text"
                name="treasurerName"
                defaultValue={settings.treasurerName}
                required
                placeholder="Contoh: Riswan, S.E. (Bendahara RPL)"
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 750,
                  outline: "none",
                }}
              />
            </div>

            {/* 7. Nama Institusi */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11.5, fontWeight: 800, color: "var(--md-on-surface)" }}>
                Nama Institusi Perguruan Tinggi
              </label>
              <input
                type="text"
                name="institutionName"
                defaultValue={settings.institutionName}
                required
                placeholder="STIMI YAPMI Makassar"
                style={{
                  width: "100%",
                  minHeight: 40,
                  borderRadius: 10,
                  border: "1px solid var(--md-outline-variant)",
                  background: "var(--md-surface)",
                  color: "var(--md-on-surface)",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 750,
                  outline: "none",
                }}
              />
            </div>

            {/* Tombol Simpan */}
            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  minHeight: 44,
                  padding: "0 28px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--md-primary)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                  boxShadow: "0 4px 14px var(--theme-glow)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{isPending ? "⏳ Menyimpan..." : "💾 Simpan Pengaturan Keuangan"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── PRATINJAU KARTU INSTRUKSI MAHASISWA (5 Kolom) ── */}
        <div className="lg:col-span-5 md-card" style={{ padding: "24px 26px", position: "sticky", top: 20 }}>
          <p style={{ margin: 0, color: "var(--md-primary)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pratinjau Live Mahasiswa
          </p>
          <h3 style={{ margin: "4px 0 16px", color: "var(--md-on-surface)", fontSize: 16, fontWeight: 900 }}>
            Tampilan Rekening di Portal Calon Mahasiswa
          </h3>

          <div
            style={{
              padding: "20px",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(30,58,138,0.04) 100%)",
              border: "1.5px solid var(--md-outline-variant)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--md-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                🏦
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)", textTransform: "uppercase" }}>
                  Rekening Tujuan Transfer Resmi
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  {settings.bankName}
                </p>
              </div>
            </div>

            <div style={{ background: "var(--md-surface)", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--md-on-surface-variant)", textTransform: "uppercase" }}>
                Nomor Rekening:
              </span>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "var(--md-primary)", letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
                {settings.accountNumber}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "var(--md-on-surface)" }}>
                a.n. {settings.accountHolder}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--md-surface-2)" }}>
              <span style={{ fontSize: 11.5, fontWeight: 750, color: "var(--md-on-surface-variant)" }}>
                Biaya Pendaftaran:
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: "var(--md-primary)", fontVariantNumeric: "tabular-nums" }}>
                {formatRupiah(settings.registrationFee)}
              </span>
            </div>
          </div>

          <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.5 }}>
            💡 Setiap kali Anda mengubah data rekening atau tarif di formulir sebelah kiri, kotak pratinjau dan halaman pendaftaran calon mahasiswa akan langsung menampilkan nomor rekening baru tersebut secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
