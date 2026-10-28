import { ensureRegistrationPayment } from "@/lib/payment-guard";
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
        setError("Gagal mengambil data klaster portofolio.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: "100%", paddingBottom: 40 }}>

      <PageHero
        tone="secondary"
        title="Portofolio Capaian Pembelajaran"
        subtitle="Lengkapi evaluasi diri, tingkat penguasaan kompetensi, dan lampiran bukti portofolio (VATM) untuk setiap mata kuliah yang Anda klaim."
      />

      <div
        style={{
          borderRadius: 20,
          background: "var(--md-surface-1)",
          border: "1px solid var(--md-outline-variant)",
          padding: "24px 28px",
          marginTop: 24,
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)" }}>
              Daftar Klaster Evaluasi Portofolio
            </h2>
            <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginTop: 2 }}>
              Form F03 dapat diakses untuk klaster yang telah menyelesaikan Uji Mandiri / LMS Asesmen.
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-secondary)" }}>
            {data.length} Klaster Portofolio
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 700 }}>
            Memuat daftar portofolio F03...
          </div>
        ) : error ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--md-error)", background: "var(--md-error-container)", borderRadius: 12 }}>
            {error}
          </div>
        ) : data.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "var(--md-surface-2)",
              borderRadius: 16,
              border: "1px dashed var(--md-outline-variant)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)" }}>
              Belum Ada Klaster Portofolio F03
            </h3>
            <p style={{ marginTop: 6, fontSize: 12.5, color: "var(--md-on-surface-variant)", maxWidth: 440, margin: "6px auto 16px" }}>
              Anda harus memilih mata kuliah pada Formulir F02 terlebih dahulu agar klaster dapat dibuat.
            </p>
            <Link
              href="/dashboard/mahasiswa/f02"
              style={{
                display: "inline-block",
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 12px var(--theme-glow)",
              }}
            >
              Isi Form F02 Sekarang &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {data.map((k: any) => {
              const progress = Math.round((k.completedEntries / k.totalEntries) * 100);

              return (
                <div
                  key={k.klasterId}
                  style={{
                    border: "1px solid var(--md-outline-variant)",
                    borderRadius: 18,
                    padding: 20,
                    background: k.canAccess ? "var(--md-surface-1)" : "var(--md-surface-2)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    opacity: k.canAccess ? 1 : 0.65,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: k.canAccess
                            ? k.isSubmitted
                              ? "var(--md-success-container)"
                              : "var(--md-primary-container)"
                            : "var(--md-surface-2)",
                          color: k.canAccess
                            ? k.isSubmitted
                              ? "var(--md-success)"
                              : "var(--md-primary)"
                            : "var(--md-on-surface-variant)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {k.canAccess ? (k.isSubmitted ? "✓ Terkirim" : "○ Terbuka") : "🔒 Terkunci"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
                        {k.completedEntries} / {k.totalEntries} Mata Kuliah
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15.5, fontWeight: 900, color: "var(--md-on-surface)", marginBottom: 12, lineHeight: 1.35 }}>
                      {k.klasterName}
                    </h3>

                    {k.canAccess && (
                      <div style={{ width: "100%", background: "var(--md-surface-2)", height: 6, borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${progress}%`,
                            background: k.isSubmitted ? "var(--md-success)" : "var(--md-primary)",
                            height: "100%",
                            borderRadius: 3,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    )}

                    {!k.canAccess && (
                      <div style={{ fontSize: 11, color: "var(--md-warning)", marginBottom: 16, fontWeight: 700 }}>
                        Selesaikan Tes Mandiri & Modul LMS terlebih dahulu untuk membuka form ini.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <button
                      onClick={() => router.push(`/dashboard/mahasiswa/f03/${k.klasterId}`)}
                      disabled={!k.canAccess}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 999,
                        fontSize: 12.5,
                        fontWeight: 800,
                        textAlign: "center",
                        background: k.canAccess ? "var(--md-primary)" : "var(--md-surface-2)",
                        color: k.canAccess ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                        border: k.canAccess ? "none" : "1px solid var(--md-outline-variant)",
                        cursor: k.canAccess ? "pointer" : "not-allowed",
                        boxShadow: k.canAccess ? "0 4px 12px var(--theme-glow)" : "none",
                        transition: "all 0.18s ease",
                      }}
                    >
                      {k.canAccess ? (k.isSubmitted ? "Lihat / Perbarui Portofolio" : "Isi Portofolio F03 →") : "Terkunci"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
