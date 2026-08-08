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
    <div style={{ width: "100%" }}>
      <PageHero
        tone="info"
        badgeText="Test Kompetensi"
        title="Asesmen Mandiri"
        subtitle="Uji capaian pembelajaran untuk mata kuliah RPL yang Anda ajukan."
      />

      <div className="md-card" style={{ padding: "20px", marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 8 }}>
          Daftar Modul Ujian Tersedia
        </h2>
        <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginBottom: 20 }}>
          Modul ujian di bawah ini disesuaikan secara otomatis dengan pilihan mata kuliah pada Form F02 Anda.
        </p>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
            Memuat daftar ujian...
          </div>
        ) : klasters.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: 40 }}>📭</span>
            <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>Belum ada tes keahlian tersedia</h3>
            <p style={{ marginTop: 6, fontSize: 13, color: "var(--md-on-surface-variant)" }}>
              Anda belum mengajukan mata kuliah di Form F02 atau kurikulum belum dipetakan.
            </p>
            <Link href="/dashboard/mahasiswa/f02" style={{ display: "inline-block", marginTop: 16, background: "var(--md-primary)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Isi Form F02
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {klasters.map((klaster) => {
              const isCompleted = klaster.status === "Completed" || klaster.status === "Submitted";
              
              return (
                <div key={klaster.id} style={{ border: "1px solid var(--md-outline-variant)", borderRadius: 16, padding: 20, background: isCompleted ? "#f8fafc" : "#fff", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 6, background: isCompleted ? "#dcfce7" : "#e0f2fe", color: isCompleted ? "#166534" : "#0284c7", textTransform: "uppercase" }}>
                      {isCompleted ? "Selesai" : "Tersedia"}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
                      {klaster.matkulCount} Matkul
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 20, lineHeight: 1.3, flex: 1 }}>
                    {klaster.namaKlaster}
                  </h3>

                  {isCompleted ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Link 
                        href={`/dashboard/mahasiswa/asesmen/${klaster.id}`}
                        style={{ display: "block", textAlign: "center", padding: "10px", background: "var(--md-primary)", border: "1px solid var(--md-primary)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none" }}
                      >
                        Buka Modul & Sertifikat
                      </Link>
                      <Link 
                        href={`/dashboard/mahasiswa/asesmen/${klaster.id}/hasil`}
                        style={{ display: "block", textAlign: "center", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "var(--md-on-surface)", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none" }}
                      >
                        Lihat Hasil Asesmen
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      href={`/dashboard/mahasiswa/asesmen/${klaster.id}`}
                      style={{ display: "block", textAlign: "center", padding: "10px", background: "var(--md-primary)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none", transition: "transform 0.2s", boxShadow: "0 4px 12px rgba(26,86,219,0.2)" }}
                    >
                      Buka Modul Pembelajaran
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
