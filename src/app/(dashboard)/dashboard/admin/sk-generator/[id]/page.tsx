"use client";

import { useEffect, useState, use } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SK_LABELS, SkType } from "@/lib/rpl-sk";
import { SkLampiranManager } from "@/components/dashboard/SkLampiranManager";

export default function SkGeneratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [skNumber, setSkNumber] = useState("");
  const [menimbang, setMenimbang] = useState("");
  const [mengingat, setMengingat] = useState("");
  const [menetapkan, setMenetapkan] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/sk-generator/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil data SK");
      const json = await res.json();
      setData(json.data);
      
      const sk = json.data.sk;
      setTitle(sk.title || "");
      setSkNumber(sk.skNumber || "");
      setMenimbang(sk.konsideranMenimbang.join("\n"));
      setMengingat(sk.dasarHukum.join("\n"));
      setMenetapkan(sk.diktumMenetapkan.join("\n"));
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title,
        skNumber,
        manualNumberOverride: skNumber !== "-",
        konsideranMenimbang: menimbang.split("\n").filter(t => t.trim() !== ""),
        dasarHukum: mengingat.split("\n").filter(t => t.trim() !== ""),
        diktumMenetapkan: menetapkan.split("\n").filter(t => t.trim() !== "")
      };

      const res = await fetch(`/api/admin/sk-generator/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      alert("Draft berhasil disimpan!");
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm("Anda yakin ingin memfinalisasi SK ini? Status akan terkunci.")) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sk-generator/${id}/finalize`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      alert("SK Berhasil difinalisasi!");
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevision = async () => {
    if (!confirm("Buat revisi baru dari SK ini?")) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sk-generator/${id}/revision`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      alert("Draft revisi dibuat. Anda akan dialihkan.");
      router.push(`/dashboard/admin/sk-generator/${json.data._id}`);
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat detail SK...</div>;
  if (!data) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  const sk = data.sk;
  const isFinal = sk.status === "FINAL";

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/admin/sk-generator" style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textDecoration: "none" }}>&larr; Kembali ke SK Generator</Link>
      </div>

      <PageHero
        badgeText={`SK v${sk.version}`}
        title={SK_LABELS[sk.skType as SkType] || sk.skType}
        subtitle="Editor Draf Surat Keputusan."
        tone="info"
      />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Editor Form */}
        <div className="md-card" style={{ flex: "1 1 500px", padding: 24 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <span style={{ 
                fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 16,
                background: sk.status === "FINAL" ? "#dcfce7" : sk.status === "DRAFT" ? "#dbeafe" : "#fef3c7",
                color: sk.status === "FINAL" ? "#166534" : sk.status === "DRAFT" ? "#1d4ed8" : "#d97706"
              }}>
                STATUS: {sk.status}
              </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 6 }}>Nomor SK</label>
              <input 
                type="text" 
                value={skNumber} 
                onChange={e => setSkNumber(e.target.value)} 
                disabled={isFinal}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "monospace" }} 
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 6 }}>Judul / Tentang</label>
              <textarea 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                disabled={isFinal}
                rows={2}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" }} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 6 }}>Menimbang (Satu poin per baris)</label>
              <textarea 
                value={menimbang} 
                onChange={e => setMenimbang(e.target.value)} 
                disabled={isFinal}
                rows={4}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" }} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 6 }}>Mengingat / Dasar Hukum (Satu poin per baris)</label>
              <textarea 
                value={mengingat} 
                onChange={e => setMengingat(e.target.value)} 
                disabled={isFinal}
                rows={5}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" }} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#475569", marginBottom: 6 }}>Memutuskan / Menetapkan (Satu poin per baris)</label>
              <textarea 
                value={menetapkan} 
                onChange={e => setMenetapkan(e.target.value)} 
                disabled={isFinal}
                rows={5}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" }} 
              />
            </div>
          </div>
        </div>

        {/* Sidebar Aksi & Lampiran */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div className="md-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Aksi Dokumen</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link
                href={`/dashboard/admin/sk-generator/${id}/preview`}
                target="_blank"
                style={{ display: "block", textAlign: "center", width: "100%", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", textDecoration: "none", marginBottom: 8 }}
              >
                Preview & Cetak SK
              </Link>

              {!isFinal && (
                <>
                  <button 
                    onClick={handleSave} disabled={saving}
                    style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#f8fafc", color: "var(--md-primary)", border: "1px solid #cbd5e1", cursor: "pointer" }}
                  >
                    Simpan Draf
                  </button>
                  <button 
                    onClick={handleFinalize} disabled={saving}
                    style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "var(--md-primary)", color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    Finalisasi SK
                  </button>
                </>
              )}

              {isFinal && (
                 <button 
                  onClick={handleRevision} disabled={saving}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#fef3c7", color: "#d97706", border: "none", cursor: "pointer" }}
                >
                  Buat Draf Revisi Baru
                </button>
              )}
            </div>
          </div>

          <div className="md-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Lampiran SK</h3>
            <SkLampiranManager sk={sk} isFinal={isFinal} onRefresh={fetchData} />
          </div>

        </div>

      </div>

    </div>
  );
}
