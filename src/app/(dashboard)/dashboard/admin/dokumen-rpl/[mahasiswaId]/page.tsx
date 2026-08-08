"use client";

import { useEffect, useState, use } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DocDetail = {
  documentType: string;
  label: string;
  status: string;
  documentNumber: string | null;
  manualNumberOverride: boolean;
  readiness: boolean;
  reason: string;
  canPreview: boolean;
  canPrint: boolean;
  existingRplDocument: any;
};

type DetailData = {
  student: { id: string; name: string; username: string };
  profile: { statusRpl: string; progressResultStatus: string } | null;
  period: { name: string; year: number } | null;
  documents: DocDetail[];
  summary: any;
};

export default function DetailPusatDokumenPage({ params }: { params: Promise<{ mahasiswaId: string }> }) {
  const router = useRouter();
  const { mahasiswaId } = use(params);
  
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dokumen-rpl/${mahasiswaId}`);
      if (!res.ok) throw new Error("Gagal mengambil detail dokumen mahasiswa");
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
  }, [mahasiswaId]);

  const handleGenerateMetadata = async (documentType: string) => {
    if (!confirm(`Generate metadata untuk dokumen ${documentType}? Ini akan menandai dokumen sebagai Siap Cetak dan membuat nomor dokumen otomatis.`)) return;

    try {
      setProcessingDoc(documentType);
      setMessage("");
      setError("");

      const res = await fetch(`/api/admin/dokumen-rpl/${mahasiswaId}/generate-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal generate metadata");

      setMessage(`Metadata ${documentType} berhasil dibuat! Nomor: ${json.documentNumber}`);
      fetchData(); // Refresh data

    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingDoc(null);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat detail dokumen...</div>;
  if (error && !data) return (
    <div style={{ padding: 24 }}>
      <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, fontWeight: 700 }}>{error}</div>
      <Link href="/dashboard/admin/dokumen-rpl" style={{ display: "inline-block", marginTop: 16, color: "var(--md-primary)" }}>&larr; Kembali</Link>
    </div>
  );

  if (!data) return null;

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/admin/dokumen-rpl" style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textDecoration: "none" }}>&larr; Kembali ke Daftar Dokumen</Link>
      </div>

      <PageHero
        badgeText="Detail Mahasiswa"
        title="Manajemen Dokumen RPL"
        subtitle={`Atur metadata, nomor dokumen, dan kesiapan cetak untuk mahasiswa ${data.student.name}.`}
        tone="primary"
      />

      {message && (
        <div style={{ padding: 16, background: "#dcfce7", color: "#166534", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Info Mahasiswa */}
      <div className="md-card" style={{ padding: 24, marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Informasi Mahasiswa</h3>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, fontSize: 14 }}>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Nama:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.student.name}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>No Reg/NIM:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.student.username}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Periode:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.period?.name || "-"}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Status RPL:</div>
            <div style={{ fontWeight: 800, color: "var(--md-primary)" }}>{data.profile?.statusRpl || "-"}</div>
          </div>
        </div>

        <div style={{ flex: "1 1 300px", background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Ringkasan Kesiapan (Prerequisite)</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Data F02</span>
              <span style={{ fontWeight: 800, color: data.summary.f02Exists ? "#166534" : "#991b1b" }}>{data.summary.f02Exists ? "Ada" : "Tidak Ada"}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Konfirmasi F03</span>
              <span style={{ fontWeight: 800, color: data.summary.isF03Confirmed ? "#166534" : "#991b1b" }}>{data.summary.isF03Confirmed ? "Sudah" : "Belum"}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Profil Penilai</span>
              <span style={{ fontWeight: 800, color: data.summary.penilaiProfilesExist ? "#166534" : "#991b1b" }}>{data.summary.penilaiProfilesExist ? "Lengkap" : "Tidak Lengkap"}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Sanggahan Mahasiswa</span>
              <span style={{ fontWeight: 800, color: data.summary.sanggahanAccepted ? "#166534" : "#991b1b" }}>{data.summary.sanggahanAccepted ? "Diterima" : "Belum Ada"}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Hasil Konversi Final</span>
              <span style={{ fontWeight: 800, color: data.summary.finalResultStatus === "FINAL" ? "#166534" : "#991b1b" }}>{data.summary.finalResultStatus === "FINAL" ? "FINAL" : "Belum Final"}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Daftar Dokumen */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Daftar Dokumen Output</h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.documents.map((doc) => {
          const isBundle = doc.documentType === "BUNDLE";
          return (
            <div key={doc.documentType} className="md-card" style={{ 
              padding: 20, 
              borderLeft: `4px solid ${doc.status === "Siap Cetak" ? "#3b82f6" : doc.status === "Sudah Dicetak" ? "#10b981" : "#cbd5e1"}`,
              background: isBundle ? "#f8fafc" : "#fff"
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{doc.label}</h4>
                    <span style={{ 
                      fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 16,
                      background: doc.status === "Siap Cetak" ? "#dbeafe" : doc.status === "Sudah Dicetak" ? "#dcfce7" : "#fee2e2",
                      color: doc.status === "Siap Cetak" ? "#1d4ed8" : doc.status === "Sudah Dicetak" ? "#166534" : "#991b1b"
                    }}>
                      {doc.status}
                    </span>
                  </div>
                  
                  {doc.documentNumber ? (
                    <div style={{ fontSize: 13, color: "#334155", marginBottom: 4, fontWeight: 600 }}>
                      No: <span style={{ fontFamily: "monospace", fontSize: 14 }}>{doc.documentNumber}</span>
                      {doc.manualNumberOverride && <span style={{ marginLeft: 8, fontSize: 10, color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: 4 }}>Manual Override</span>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", marginBottom: 4 }}>Nomor dokumen belum di-generate</div>
                  )}

                  {!doc.readiness && (
                    <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 8, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span>⚠️</span> <span>{doc.reason}</span>
                    </div>
                  )}
                  {doc.readiness && doc.status === "Belum Siap" && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                      Persyaratan lengkap. Silakan generate metadata untuk menyiapkan dokumen.
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {/* Generate Metadata Button */}
                  {doc.readiness && doc.status === "Belum Siap" && (
                    <button 
                      onClick={() => handleGenerateMetadata(doc.documentType)}
                      disabled={processingDoc === doc.documentType}
                      style={{ 
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, 
                        background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1", cursor: "pointer"
                      }}
                    >
                      {processingDoc === doc.documentType ? "Generating..." : "Generate Metadata"}
                    </button>
                  )}

                  {/* Preview/Print Actions */}
                  {isBundle ? (
                    <div style={{ display: "flex", gap: 12 }}>
                      <Link 
                        href={`/dashboard/admin/dokumen-rpl/${mahasiswaId}/bundle`} 
                        style={{ 
                          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, 
                          background: doc.canPreview ? "#eff6ff" : "#f1f5f9", 
                          color: doc.canPreview ? "#1d4ed8" : "#94a3b8", 
                          textDecoration: "none", cursor: doc.canPreview ? "pointer" : "not-allowed",
                          pointerEvents: doc.canPreview ? "auto" : "none"
                        }}
                      >
                        Lihat Bundle
                      </Link>
                    </div>
                  ) : (
                    <>
                      <button 
                        disabled={!doc.canPreview}
                        style={{ 
                          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, 
                          background: doc.canPreview ? "#eff6ff" : "#f1f5f9", 
                          color: doc.canPreview ? "#1d4ed8" : "#94a3b8", 
                          border: "none", cursor: doc.canPreview ? "pointer" : "not-allowed"
                        }}
                        onClick={() => alert(`Cetak individual belum tersedia untuk ${doc.label}. Gunakan Cetak Bundle PDF.`)}
                      >
                        Preview Individual
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
