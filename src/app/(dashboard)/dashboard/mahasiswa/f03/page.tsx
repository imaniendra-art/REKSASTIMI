"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

export default function F03ListPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/mahasiswa/f03?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal mengambil data klaster.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        tone="secondary"
        badgeText="Evaluasi Mandiri"
        title="Formulir F03 (Portofolio)"
        subtitle="Lengkapi evaluasi diri dan unggah bukti portofolio untuk setiap mata kuliah."
      />

      <div className="md-card" style={{ padding: "20px", marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 8 }}>
          Daftar Klaster Evaluasi
        </h2>
        <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginBottom: 20 }}>
          Pilih klaster di bawah ini untuk mengisi Evaluasi Diri (F03). Form F03 hanya dapat diakses untuk klaster yang telah Anda selesaikan Tes Kompetensinya.
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
            Memuat daftar F03...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "red" }}>
            {error}
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: 40 }}>📭</span>
            <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>Belum ada form F03</h3>
            <p style={{ marginTop: 6, fontSize: 13, color: "var(--md-on-surface-variant)" }}>
              Anda harus mengajukan mata kuliah (F02) terlebih dahulu.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {data.map((k: any) => {
              const progress = Math.round((k.completedEntries / k.totalEntries) * 100);
              
              return (
                <div key={k.klasterId} style={{ border: "1px solid var(--md-outline-variant)", borderRadius: 16, padding: 20, background: k.canAccess ? "#fff" : "#f8fafc", display: "flex", flexDirection: "column", opacity: k.canAccess ? 1 : 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 6, background: k.canAccess ? "#dcfce7" : "#f1f5f9", color: k.canAccess ? "#166534" : "#64748b", textTransform: "uppercase" }}>
                      {k.canAccess ? (k.isSubmitted ? "Terkirim" : "Terbuka") : "Terkunci"}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
                      {k.completedEntries} / {k.totalEntries} Matkul
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 12, lineHeight: 1.3, flex: 1 }}>
                    {k.klasterName}
                  </h3>

                  {k.canAccess && (
                    <div style={{ width: "100%", background: "#e2e8f0", height: 6, borderRadius: 3, marginBottom: 16 }}>
                      <div style={{ width: `${progress}%`, background: k.isSubmitted ? "#16a34a" : "var(--md-primary)", height: "100%", borderRadius: 3, transition: "width 0.3s" }}></div>
                    </div>
                  )}

                  {!k.canAccess && (
                    <div style={{ fontSize: 11, color: "var(--md-error)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                      <i className="fa-solid fa-lock text-xs"></i> Selesaikan Ujian Dulu
                    </div>
                  )}

                  <button
                    onClick={() => router.push(`/dashboard/mahasiswa/f03/${k.klasterId}`)}
                    disabled={!k.canAccess}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      textAlign: "center",
                      textDecoration: "none",
                      background: k.canAccess ? "var(--md-primary)" : "#e2e8f0",
                      color: k.canAccess ? "#fff" : "#94a3b8",
                      border: k.canAccess ? "1px solid var(--md-primary)" : "none",
                      cursor: k.canAccess ? "pointer" : "not-allowed",
                      transition: "all 0.2s"
                    }}
                  >
                    {k.canAccess ? (k.isSubmitted ? 'Lihat / Edit F03' : 'Isi F03') : 'Terkunci'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
