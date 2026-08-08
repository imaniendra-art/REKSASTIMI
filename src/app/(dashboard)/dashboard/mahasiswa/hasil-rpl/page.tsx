"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

export default function MahasiswaHasilRplPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mahasiswa/hasil-rpl`);
      const json = await res.json();
      if (res.ok) {
        setResults(json.data || []);
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

  const handleTerima = async (id: string) => {
    if (!confirm("Apakah Anda yakin MENERIMA hasil konversi ini secara final? Anda tidak dapat lagi mengajukan sanggahan.")) return;
    try {
      const res = await fetch(`/api/mahasiswa/hasil-rpl/${id}/terima`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Hasil RPL berhasil diterima.");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleSanggah = async (id: string) => {
    const catatan = prompt("Tuliskan alasan sanggahan / mata kuliah mana yang disanggah:");
    if (!catatan) return;
    try {
      const res = await fetch(`/api/mahasiswa/hasil-rpl/${id}/sanggah`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catatanMahasiswa: catatan })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Sanggahan berhasil diajukan.");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const btnStyle = { padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Penetapan"
        title="Hasil Rekognisi Pembelajaran Lampau"
        subtitle="Lihat draf konversi nilai Anda, dan berikan persetujuan atau sanggahan sebelum pengesahan final."
        tone="primary"
      />

      {message && (
        <div style={{ padding: 16, background: "#dcfce7", color: "#166534", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {loading ? <p>Memuat data...</p> : results.length === 0 ? (
        <div className="md-card" style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
          Hasil RPL Anda belum tersedia atau belum dikirim oleh admin.
        </div>
      ) : (
        results.map(r => (
          <div key={r._id} className="md-card animate-fade-up" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800 }}>Draf Konversi Akademik</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Status: <b style={{ color: r.statusFinalisasi === "FINAL" ? "#1d4ed8" : "#ea580c" }}>{r.statusFinalisasi}</b></p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total SKS Diakui</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--md-primary)" }}>{r.totalSksDiakui} <span style={{ fontSize: 14 }}>SKS</span></div>
              </div>
            </div>

            {r.mahasiswaDecisionStatus === "DITERIMA" && (
              <div style={{ padding: 16, background: "#dcfce7", borderRadius: 8, marginBottom: 20, color: "#166534", fontWeight: 700 }}>
                Anda telah menyetujui dan menerima hasil ini. 
              </div>
            )}

            {r.sanggahanAktif && (
              <div style={{ padding: 16, background: "#fee2e2", borderRadius: 8, marginBottom: 20, color: "#991b1b", fontWeight: 700 }}>
                Sanggahan Anda sedang diproses oleh admin. <br/>
                <span style={{ fontWeight: 400, fontSize: 13 }}>Catatan: {r.sanggahanAktif.catatanMahasiswa}</span>
              </div>
            )}

            {r.mahasiswaDecisionStatus === "SANGGAHAN_SELESAI" && (
              <div style={{ padding: 16, background: "#e0f2fe", borderRadius: 8, marginBottom: 20, color: "#075985", fontWeight: 700 }}>
                Sanggahan Anda telah ditindaklanjuti. Silakan periksa hasil terbaru.
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, color: "#64748b" }}>
                    <th style={{ padding: 12 }}>Kode</th>
                    <th style={{ padding: 12 }}>Mata Kuliah</th>
                    <th style={{ padding: 12 }}>SKS</th>
                    <th style={{ padding: 12 }}>Nilai</th>
                    <th style={{ padding: 12 }}>Jenis Rekognisi</th>
                  </tr>
                </thead>
                <tbody>
                  {r.recognizedCourses.map((c: any) => (
                    <tr key={c.courseId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 12, fontSize: 13, fontWeight: 700 }}>{c.kode}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{c.nama}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{c.sks}</td>
                      <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: "var(--md-primary)" }}>{c.nilaiHuruf}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{c.jenisRekognisi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
              {r.mahasiswaDecisionStatus === "MENUNGGU_RESPON" && r.statusFinalisasi !== "FINAL" && (
                <>
                  <button onClick={() => handleTerima(r._id)} style={{ ...btnStyle, background: "#166534", color: "white" }}>✅ Terima Hasil</button>
                  <button onClick={() => handleSanggah(r._id)} style={{ ...btnStyle, background: "#fee2e2", color: "#991b1b" }}>❌ Ajukan Sanggahan</button>
                </>
              )}

              {(r.mahasiswaDecisionStatus === "DITERIMA" || r.mahasiswaDecisionStatus === "SANGGAHAN_SELESAI") && (
                <Link href={`/dashboard/mahasiswa/hasil-rpl/surat-sanggahan`} target="_blank" style={{ ...btnStyle, background: "#1e40af", color: "white", textDecoration: "none" }}>
                  📄 Cetak Surat Pernyataan
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
