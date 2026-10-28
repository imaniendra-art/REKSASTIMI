"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

type AsesmenKlaster = {
  id: string;
  namaKlaster: string;
  lmsDeskripsi: string;
  matkulCount: number;
  status: "Not Started" | "Draft" | "Submitted" | "Completed";
  submittedAt: string | null;
};

export function AsesmenListClient() {
  const { data: klastersData, isLoading } = useQuery({
    queryKey: ["mahasiswa_asesmen"],
    queryFn: async () => {
      const res = await fetch("/api/mahasiswa/asesmen");
      if (!res.ok) throw new Error("Failed to fetch asesmen");
      return res.json() as Promise<{ data: AsesmenKlaster[] }>;
    },
  });

  const klasters = klastersData?.data || [];

  return (
    <div style={{ width: "100%", paddingBottom: 40 }}>

      <PageHero
        tone="primary"
        title="Modul Pembelajaran & Uji Capaian"
        subtitle="Pelajari ringkasan materi dan selesaikan tes mandiri untuk klaster mata kuliah yang telah Anda klaim pada formulir F02."
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
              Daftar Klaster Mata Kuliah Tersedia
            </h2>
            <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginTop: 2 }}>
              Klaster ujian otomatis dipetakan sesuai pilihan mata kuliah pada Form F02 Anda.
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--md-primary)" }}>
            {klasters.length} Klaster Terpetakan
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 700 }}>
            Memuat modul pembelajaran klaster...
          </div>
        ) : klasters.length === 0 ? (
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
              Belum Ada Klaster Ujian Tersedia
            </h3>
            <p style={{ marginTop: 6, fontSize: 12.5, color: "var(--md-on-surface-variant)", maxWidth: 460, margin: "6px auto 16px" }}>
              Anda belum memilih mata kuliah pada Formulir F02 atau mata kuliah terpilih belum memiliki pemetaan klaster.
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
              Buka Form F02 Sekarang &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {klasters.map((klaster) => {
              const isCompleted = klaster.status === "Completed" || klaster.status === "Submitted";

              return (
                <div
                  key={klaster.id}
                  style={{
                    border: "1px solid var(--md-outline-variant)",
                    borderRadius: 18,
                    padding: 20,
                    background: isCompleted ? "var(--md-surface-2)" : "var(--md-surface-1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
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
                          background: isCompleted ? "var(--md-success-container)" : "var(--md-primary-container)",
                          color: isCompleted ? "var(--md-success)" : "var(--md-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {isCompleted ? "✓ Selesai" : "○ Siap Diambil"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--md-on-surface-variant)" }}>
                        {klaster.matkulCount} Mata Kuliah
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15.5, fontWeight: 900, color: "var(--md-on-surface)", marginBottom: 12, lineHeight: 1.35 }}>
                      {klaster.namaKlaster}
                    </h3>

                    {klaster.lmsDeskripsi && (
                      <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", lineHeight: 1.5, marginBottom: 16 }}>
                        {klaster.lmsDeskripsi}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    {isCompleted ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <Link
                          href={`/dashboard/mahasiswa/asesmen/${klaster.id}`}
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "9px 14px",
                            background: "var(--md-primary)",
                            color: "var(--md-on-primary)",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          Buka Materi & Unduh Sertifikat
                        </Link>
                        <Link
                          href={`/dashboard/mahasiswa/asesmen/${klaster.id}/hasil`}
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "8px 14px",
                            background: "var(--md-surface-1)",
                            border: "1px solid var(--md-outline)",
                            color: "var(--md-on-surface)",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          Lihat Rincian Hasil Asesmen
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/dashboard/mahasiswa/asesmen/${klaster.id}`}
                        style={{
                          display: "block",
                          textAlign: "center",
                          padding: "10px 14px",
                          background: "var(--md-primary)",
                          color: "var(--md-on-primary)",
                          borderRadius: 999,
                          fontSize: 12.5,
                          fontWeight: 800,
                          textDecoration: "none",
                          boxShadow: "0 4px 14px var(--theme-glow)",
                        }}
                      >
                        Buka Modul & Uji Mandiri &rarr;
                      </Link>
                    )}
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
