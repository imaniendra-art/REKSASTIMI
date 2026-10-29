"use client";

import Link from "next/link";

interface DocumentPreviewBarProps {
  title: string;
  code: string;
  studentName?: string;
  registrationNumber?: string;
  backHref?: string;
}

export function DocumentPreviewBar({
  title,
  code,
  studentName,
  registrationNumber,
  backHref = "/dashboard/mahasiswa/download",
}: DocumentPreviewBarProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <aside
      aria-label="Kontrol Dokumen"
      className="no-print"
      style={{
        position: "fixed",
        top: 16,
        right: 18,
        zIndex: 9999,
        background: "#ffffff",
        border: "1.5px solid var(--md-outline-variant, #cbd5e1)",
        borderRadius: 999,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        padding: "6px 10px 6px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#0f172a",
        maxWidth: "calc(100vw - 36px)",
      }}
    >
      {/* Keterangan Dokumen Ringkas di sebelah kanan (sebelum tombol) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            background: "var(--md-primary, #0d9488)",
            color: "#ffffff",
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          {code}
        </span>

        <div style={{ minWidth: 0, textAlign: "left" }} className="hidden sm:block">
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 800,
              color: "#0f172a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200,
            }}
          >
            {title}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "#64748b", whiteSpace: "nowrap" }}>
            {studentName ? studentName : "MAHASISWA RPL"} • <span style={{ color: "var(--md-primary, #0d9488)", fontWeight: 800 }}>A4</span>
          </p>
        </div>
      </div>

      {/* Garis Pembatas Halus */}
      <div style={{ width: 1, height: 22, background: "#e2e8f0", flexShrink: 0 }} className="hidden sm:block" />

      {/* Tombol Aksi */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button
          type="button"
          onClick={handlePrint}
          title="Cetak Dokumen atau Simpan sebagai PDF"
          style={{
            background: "var(--md-primary, #0d9488)",
            color: "#ffffff",
            border: "none",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px var(--theme-glow, rgba(13, 148, 136, 0.25))",
            transition: "all 0.16s ease",
            letterSpacing: "0.02em",
          }}
        >
          <span>🖨️</span>
          <span>Cetak / Unduh PDF</span>
        </button>

        <Link
          href={backHref}
          title="Tutup Preview Dokumen"
          style={{
            background: "var(--md-surface-2, #f1f5f9)",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.16s ease",
          }}
        >
          <span>✕</span>
          <span className="hidden xs:inline">Tutup</span>
        </Link>
      </div>
    </aside>
  );
}
