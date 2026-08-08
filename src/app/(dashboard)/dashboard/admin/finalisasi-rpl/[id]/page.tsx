"use client";

import { useEffect, useState, use } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FinalisasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Edit states
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setCourses(json.data.recognizedCourses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recognizedCourses: courses })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Draf berhasil disimpan");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleSend = async () => {
    if (!confirm("Kirim draf ini ke mahasiswa?")) return;
    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}/send-to-student`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Berhasil dikirim ke mahasiswa");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleResolveSanggahan = async (action: string) => {
    const note = prompt("Berikan catatan balasan (wajib):");
    if (!note) return;
    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}/resolve-sanggahan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catatanAdmin: note })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Sanggahan diselesaikan");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleFinalize = async () => {
    if (!confirm("KUNCI FINAL hasil konversi mahasiswa ini? Tindakan ini tidak dapat diubah secara langsung.")) return;
    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${id}/finalize`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Hasil berhasil difinalisasi");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat...</div>;
  if (!data) return <div style={{ padding: 40, color: "red" }}>Data tidak ditemukan</div>;

  const isFinal = data.statusFinalisasi === "FINAL";
  const activeSanggahan = data.sanggahans?.find((s:any) => s.status === "SUBMITTED" || s.status === "DITINDAKLANJUTI");

  const btnStyle = { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" };

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <PageHero
        badgeText={isFinal ? "FINAL" : "DRAFT"}
        title={`Konversi: ${data.mahasiswa.name}`}
        subtitle={`NIM/Username: ${data.mahasiswa.username}`}
        tone={isFinal ? "primary" : "warning"}
      />

      {message && (
        <div style={{ padding: 16, background: "#dcfce7", color: "#166534", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {/* STATUS BANNER */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Status Respon Mahasiswa</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{data.mahasiswaDecisionStatus.replace("_", " ")}</div>
        </div>
        <div style={{ width: 1, background: "#e2e8f0" }} />
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Status Pleno</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{data.plenoStatus.replace("_", " ")}</div>
        </div>
        <div style={{ width: 1, background: "#e2e8f0" }} />
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Diakui</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{data.totalSksDiakui} SKS</div>
        </div>
      </div>

      {/* SANGGAHAN PANEL */}
      {activeSanggahan && (
        <div style={{ padding: 20, background: "#fee2e2", border: "1px solid #f87171", borderRadius: 12, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#991b1b", fontSize: 16, fontWeight: 800 }}>⚠️ Mahasiswa Mengajukan Sanggahan!</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#7f1d1d" }}>
            <strong>Catatan Mahasiswa:</strong> {activeSanggahan.catatanMahasiswa}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => handleResolveSanggahan("TERIMA_SANGGAHAN")} style={{ ...btnStyle, background: "#166534", color: "#fff" }}>Selesaikan (Terima Sanggahan)</button>
            <button onClick={() => handleResolveSanggahan("TOLAK_SANGGAHAN")} style={{ ...btnStyle, background: "#991b1b", color: "#fff" }}>Selesaikan (Tolak Sanggahan)</button>
          </div>
        </div>
      )}

      {/* COURSES EDITOR */}
      <div className="md-card" style={{ padding: 24, marginBottom: 20, overflowX: "auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Daftar Mata Kuliah Diakui</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, color: "#64748b" }}>
              <th style={{ padding: 12 }}>Kode</th>
              <th style={{ padding: 12 }}>Mata Kuliah</th>
              <th style={{ padding: 12 }}>SKS</th>
              <th style={{ padding: 12 }}>Nilai</th>
              <th style={{ padding: 12 }}>Jenis Rekognisi</th>
              <th style={{ padding: 12 }}>Sumber / PT Asal</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c.courseId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, fontSize: 13, fontWeight: 700 }}>{c.kode}</td>
                <td style={{ padding: 12, fontSize: 13 }}>{c.nama}</td>
                <td style={{ padding: 12, fontSize: 13 }}>{c.sks}</td>
                <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: "var(--md-primary)" }}>{c.nilaiHuruf}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <select 
                      disabled={isFinal}
                      value={c.jenisRekognisi} 
                      onChange={e => {
                        const newC = [...courses];
                        newC[idx].jenisRekognisi = e.target.value;
                        setCourses(newC);
                      }}
                      style={{ padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
                    >
                      <option value="Perolehan SKS">Perolehan SKS</option>
                      <option value="Transfer SKS">Transfer SKS</option>
                    </select>
                    {c.needsRekognisiValidation && c.jenisRekognisi !== "Transfer SKS" && (
                      <span style={{ fontSize: 10, color: "#ea580c", fontWeight: 700 }}>💡 Saran Sistem: Transfer SKS</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <input 
                    type="text" 
                    disabled={isFinal}
                    value={c.sumber || ""} 
                    placeholder="Nama Institusi / Sumber"
                    onChange={e => {
                      const newC = [...courses];
                      newC[idx].sumber = e.target.value;
                      setCourses(newC);
                    }}
                    style={{ padding: 6, width: "100%", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isFinal && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSaveDraft} style={{ ...btnStyle, background: "#f1f5f9", color: "#334155" }}>
              💾 Simpan Perubahan Draf
            </button>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="md-card" style={{ padding: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button 
          onClick={handleSend} 
          disabled={isFinal || !!activeSanggahan}
          style={{ ...btnStyle, background: "#3b82f6", color: "#fff", opacity: (isFinal || !!activeSanggahan) ? 0.5 : 1 }}
        >
          Kirim ke Mahasiswa
        </button>

        <button 
          onClick={handleFinalize} 
          disabled={isFinal || !!activeSanggahan || (data.mahasiswaDecisionStatus !== "DITERIMA" && data.mahasiswaDecisionStatus !== "SANGGAHAN_SELESAI")}
          style={{ ...btnStyle, background: "#10b981", color: "#fff", opacity: (isFinal || !!activeSanggahan || (data.mahasiswaDecisionStatus !== "DITERIMA" && data.mahasiswaDecisionStatus !== "SANGGAHAN_SELESAI")) ? 0.5 : 1 }}
        >
          ✅ FINALISASI HASIL
        </button>

        <Link 
          href={`/dashboard/admin/finalisasi-rpl/${id}/lampiran-konversi`} 
          target="_blank"
          style={{ ...btnStyle, background: "#f1f5f9", color: "#334155", textDecoration: "none" }}
        >
          🖨️ Preview Lampiran Konversi
        </Link>
      </div>

    </div>
  );
}
