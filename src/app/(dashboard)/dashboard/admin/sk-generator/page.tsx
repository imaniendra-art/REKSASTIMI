"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { SK_TYPES, SK_LABELS, CHECKLIST_AWAL_PERIODE, SkType } from "@/lib/rpl-sk";

export default function SkGeneratorPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingType, setProcessingType] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sk-generator");
      if (!res.ok) throw new Error("Gagal mengambil data SK. Pastikan ada periode aktif.");
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateDraft = async (skType: string) => {
    try {
      setProcessingType(skType);
      const res = await fetch("/api/admin/sk-generator/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skType, periodId: data.skList.length > 0 ? data.skList[0].periodId : undefined }) // periodId will be handled by backend if not provided, but ideally we send the active one. Backend will use active period if we omit it.
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      alert("Draft SK berhasil dibuat!");
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingType(null);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat modul SK Generator...</div>;

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <PageHero
        badgeText="Legal & Arsip"
        title="SK Generator RPL"
        subtitle="Kelola SK dan dokumen legal RPL sejak awal periode hingga Pleno."
        tone="info"
      />

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Ringkasan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total SK Periode Ini</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{data.summary.total}</span>
            </div>
            <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #fef2f2, #fee2e2)" }}>
              <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 700, textTransform: "uppercase" }}>Belum Dibuat (Wajib)</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#b91c1c", marginTop: 8 }}>{data.summary.belumAdaAwalPeriode}</span>
            </div>
            <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #eff6ff, #dbeafe)" }}>
              <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase" }}>Draft / Revisi</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#1d4ed8", marginTop: 8 }}>{data.summary.draft + data.summary.perluRevisi}</span>
            </div>
            <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #f0fdf4, #dcfce7)" }}>
              <span style={{ fontSize: 13, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Final Tersimpan</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#166534", marginTop: 8 }}>{data.summary.final}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Kolom Checklist */}
            <div className="md-card" style={{ flex: "1 1 350px", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Checklist Dokumen Awal Periode</h3>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Dokumen berikut wajib diselesaikan sebelum proses RPL dilanjutkan ke tahap Plotting.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CHECKLIST_AWAL_PERIODE.map(type => {
                  const status = data.checklistStatus[type];
                  const label = SK_LABELS[type as SkType];
                  const skItem = data.skList.find((s:any) => s.skType === type);

                  return (
                    <div key={type} style={{ 
                      padding: 16, borderRadius: 12, border: "1px solid #e2e8f0",
                      background: status === "Belum Ada" ? "#fff" : status === "FINAL" ? "#f0fdf4" : "#f8fafc"
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{label}</div>
                      
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ 
                          fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 16,
                          background: status === "Belum Ada" ? "#fee2e2" : status === "FINAL" ? "#dcfce7" : "#dbeafe",
                          color: status === "Belum Ada" ? "#991b1b" : status === "FINAL" ? "#166534" : "#1d4ed8"
                        }}>
                          {status}
                        </span>

                        {status === "Belum Ada" ? (
                          <button 
                            onClick={() => handleGenerateDraft(type)}
                            disabled={processingType === type}
                            style={{ 
                              padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, 
                              background: "var(--md-primary)", color: "#fff", border: "none", cursor: "pointer"
                            }}
                          >
                            {processingType === type ? "Memproses..." : "Generate Draft"}
                          </button>
                        ) : (
                          <Link href={`/dashboard/admin/sk-generator/${skItem._id}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--md-primary)", textDecoration: "none" }}>
                            Lihat Detail &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Semua SK */}
            <div className="md-card" style={{ flex: "2 1 600px", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Semua Dokumen & SK Periode</h3>
              </div>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 800, color: "#475569" }}>TIPE & JUDUL</th>
                      <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 800, color: "#475569" }}>NOMOR</th>
                      <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 800, color: "#475569" }}>STATUS</th>
                      <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 800, color: "#475569", textAlign: "right" }}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.skList.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Belum ada draf SK yang di-generate pada periode ini.</td>
                      </tr>
                    )}
                    {data.skList.map((sk: any) => (
                      <tr key={sk._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--md-primary)", marginBottom: 4 }}>{SK_LABELS[sk.skType as SkType] || sk.skType}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{sk.title}</div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 13, color: sk.skNumber !== "-" ? "#0f172a" : "#94a3b8" }}>{sk.skNumber}</div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                           <span style={{ 
                            fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 16,
                            background: sk.status === "FINAL" ? "#dcfce7" : sk.status === "DRAFT" ? "#dbeafe" : "#fef3c7",
                            color: sk.status === "FINAL" ? "#166534" : sk.status === "DRAFT" ? "#1d4ed8" : "#d97706"
                          }}>
                            {sk.status} (v{sk.version})
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <Link href={`/dashboard/admin/sk-generator/${sk._id}`} style={{ fontSize: 13, fontWeight: 700, color: "var(--md-primary)", textDecoration: "none" }}>
                            Kelola
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
