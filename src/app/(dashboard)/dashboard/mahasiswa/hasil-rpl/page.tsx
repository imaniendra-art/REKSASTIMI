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
    setTimeout(() => setMessage(""), 3500);
  };

  const handleTerima = async (id: string) => {
    if (!confirm("Apakah Anda yakin MENERIMA hasil konversi ini secara final? Anda tidak dapat lagi mengajukan sanggahan.")) return;
    try {
      const res = await fetch(`/api/mahasiswa/hasil-rpl/${id}/terima`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).message);
      showMsg("Hasil RPL berhasil diterima secara resmi.");
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
      showMsg("Sanggahan resmi berhasil diajukan.");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  return (
    <div style={{ width: "100%", paddingBottom: 40 }}>
      {/* ── Breadcrumb Back ── */}
      <div style={{ marginBottom: 14 }}>
        <Link
          href="/dashboard/mahasiswa"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 800,
            color: "var(--md-primary)",
            textDecoration: "none",
          }}
        >
          <span>←</span>
          <span>Kembali ke Beranda Mahasiswa</span>
        </Link>
      </div>

      <PageHero
        badgeIcon="📜"
        badgeText="Penetapan & Berita Acara"
        title="Draf Hasil Rekognisi SKS (RPL)"
        subtitle="Tinjau draf konversi nilai dan pengakuan SKS dari tim penilai. Anda dapat menerima hasil atau mengajukan sanggahan resmi sebelum sidang pleno institusi."
        tone="primary"
      />

      {message && (
        <div
          style={{
            padding: "14px 18px",
            background: "var(--md-success-container)",
            color: "var(--md-success)",
            border: "1px solid var(--md-success)",
            borderRadius: 14,
            marginBottom: 20,
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 700 }}>
          Memuat draf penetapan hasil RPL...
        </div>
      ) : results.length === 0 ? (
        <div
          style={{
            borderRadius: 20,
            background: "var(--md-surface-1)",
            border: "1px solid var(--md-outline-variant)",
            padding: 40,
            textAlign: "center",
            color: "var(--md-on-surface-variant)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)" }}>
            Belum Ada Hasil Konversi Tersedia
          </h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--md-on-surface-variant)" }}>
            Hasil asesmen sedang dalam proses evaluasi oleh asesor atau belum diterbitkan oleh bagian akademik.
          </p>
        </div>
      ) : (
        results.map((r) => (
          <div
            key={r._id}
            style={{
              borderRadius: 20,
              background: "var(--md-surface-1)",
              border: "1px solid var(--md-outline-variant)",
              padding: 24,
              marginBottom: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Draf Berita Acara Rekognisi Akademik
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--md-on-surface-variant)" }}>
                  Status Dokumen: <strong style={{ color: r.statusFinalisasi === "FINAL" ? "var(--md-primary)" : "var(--md-warning)" }}>{r.statusFinalisasi}</strong>
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--md-on-surface-variant)", textTransform: "uppercase", fontWeight: 800 }}>
                  Total SKS Diakui
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--md-primary)" }}>
                  {r.totalSksDiakui} <span style={{ fontSize: 13, fontWeight: 700 }}>SKS</span>
                </div>
              </div>
            </div>

            {r.mahasiswaDecisionStatus === "DITERIMA" && (
              <div style={{ padding: "12px 16px", background: "var(--md-success-container)", borderRadius: 10, marginBottom: 20, color: "var(--md-success)", fontWeight: 800, fontSize: 13 }}>
                ✓ Anda telah menerima dan menyetujui hasil konversi ini secara resmi.
              </div>
            )}

            {r.sanggahanAktif && (
              <div style={{ padding: "12px 16px", background: "var(--md-error-container)", borderRadius: 10, marginBottom: 20, color: "var(--md-error)", fontWeight: 800, fontSize: 13 }}>
                Sanggahan Anda sedang dalam proses peninjauan oleh tim akademik.<br/>
                <span style={{ fontWeight: 600, fontSize: 12 }}>Catatan Sanggahan: {r.sanggahanAktif.catatanMahasiswa}</span>
              </div>
            )}

            {r.mahasiswaDecisionStatus === "SANGGAHAN_SELESAI" && (
              <div style={{ padding: "12px 16px", background: "var(--md-primary-container)", borderRadius: 10, marginBottom: 20, color: "var(--md-primary)", fontWeight: 800, fontSize: 13 }}>
                Sanggahan telah ditindaklanjuti. Silakan periksa rincian terbaru di bawah ini.
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "var(--md-surface-2)", textAlign: "left", fontSize: 11.5, color: "var(--md-on-surface-variant)", borderBottom: "1px solid var(--md-outline-variant)" }}>
                    <th style={{ padding: 12, fontWeight: 800 }}>Kode</th>
                    <th style={{ padding: 12, fontWeight: 800 }}>Nama Mata Kuliah</th>
                    <th style={{ padding: 12, fontWeight: 800, textAlign: "center" }}>SKS</th>
                    <th style={{ padding: 12, fontWeight: 800, textAlign: "center" }}>Nilai Konversi</th>
                    <th style={{ padding: 12, fontWeight: 800 }}>Jenis Pengakuan</th>
                  </tr>
                </thead>
                <tbody>
                  {r.recognizedCourses.map((c: any) => (
                    <tr key={c.courseId} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                      <td style={{ padding: 12, fontSize: 12.5, fontWeight: 800, fontFamily: "monospace" }}>{c.kode}</td>
                      <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: "var(--md-on-surface)" }}>{c.nama}</td>
                      <td style={{ padding: 12, fontSize: 13, textAlign: "center", fontWeight: 800 }}>{c.sks}</td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: "center", fontWeight: 900, color: "var(--md-primary)" }}>{c.nilaiHuruf}</td>
                      <td style={{ padding: 12, fontSize: 12.5, color: "var(--md-on-surface-variant)" }}>{c.jenisRekognisi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--md-outline-variant)", paddingTop: 18 }}>
              {r.mahasiswaDecisionStatus === "MENUNGGU_RESPON" && r.statusFinalisasi !== "FINAL" && (
                <>
                  <button
                    onClick={() => handleTerima(r._id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      border: "none",
                      background: "var(--md-success)",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(5,150,105,0.2)",
                    }}
                  >
                    ✓ Terima & Setujui Hasil Konversi
                  </button>
                  <button
                    onClick={() => handleSanggah(r._id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      border: "1px solid var(--md-error)",
                      background: "var(--md-error-container)",
                      color: "var(--md-error)",
                    }}
                  >
                    ✕ Ajukan Sanggahan Resmi
                  </button>
                </>
              )}

              {(r.mahasiswaDecisionStatus === "DITERIMA" || r.mahasiswaDecisionStatus === "SANGGAHAN_SELESAI") && (
                <Link
                  href={`/dashboard/mahasiswa/hasil-rpl/surat-sanggahan`}
                  target="_blank"
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 800,
                    textDecoration: "none",
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    boxShadow: "0 4px 12px var(--theme-glow)",
                  }}
                >
                  Cetak Surat Pernyataan Rekognisi &rarr;
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
