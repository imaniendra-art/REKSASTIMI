"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";

type DokumenListItem = {
  mahasiswaId: string;
  nama: string;
  username: string;
  periode: string;
  statusRpl: string;
  progressResultStatus: string;
  statusBundle: string;
  alasanBelumSiap: string;
};

export default function PusatDokumenRplPage() {
  const [data, setData] = useState<DokumenListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [filterBundle, setFilterBundle] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/admin/periode");
      if (res.ok) {
        const json = await res.json();
        setPeriods(json.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/dokumen-rpl", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (filterBundle) url.searchParams.set("statusBundle", filterBundle);
      if (selectedPeriod) url.searchParams.set("periodId", selectedPeriod);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Gagal mengambil data pusat dokumen");
      const json = await res.json();
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delay);
  }, [search, filterBundle, selectedPeriod]);

  const totalMahasiswa = data.length;
  const siapBundle = data.filter(d => d.statusBundle === "Siap Cetak").length;
  const belumSiap = data.filter(d => d.statusBundle === "Belum Siap").length;
  const sudahCetak = data.filter(d => d.statusBundle === "Sudah Dicetak").length;

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <PageHero
        badgeText="Output & Dokumen"
        title="Pusat Dokumen RPL"
        subtitle="Kelola kesiapan, nomor dokumen, preview, dan cetak bundle dokumen akhir RPL."
        tone="primary"
      />

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Panel Aksi Kolektif & SIERRA */}
      <div className="md-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 16, fontWeight: 800 }}>Aksi Kolektif & Export SIERRA</h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Export data siap olah untuk kebutuhan pelaporan SIERRA.</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px", maxWidth: 300 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Pilih Periode</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", backgroundColor: "#fff" }}
            >
              <option value="">-- Semua Periode --</option>
              {periods.map(p => (
                <option key={p._id} value={p._id}>{p.academicYear} - {p.semester} ({p.name})</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a 
              href={selectedPeriod ? `/api/admin/export-sierra/rekap-mahasiswa?periodId=${selectedPeriod}` : `/api/admin/export-sierra/rekap-mahasiswa`} 
              target="_blank" rel="noreferrer"
              style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#10b981", color: "#fff", textDecoration: "none" }}>
              ⬇️ Rekap Mhs
            </a>
            <a 
              href={selectedPeriod ? `/api/admin/export-sierra/detail-matkul?periodId=${selectedPeriod}` : `/api/admin/export-sierra/detail-matkul`} 
              target="_blank" rel="noreferrer"
              style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#10b981", color: "#fff", textDecoration: "none" }}>
              ⬇️ Detail Matkul
            </a>
            <a 
              href={selectedPeriod ? `/api/admin/export-sierra/penilai-penugasan?periodId=${selectedPeriod}` : `/api/admin/export-sierra/penilai-penugasan`} 
              target="_blank" rel="noreferrer"
              style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#10b981", color: "#fff", textDecoration: "none" }}>
              ⬇️ Penugasan
            </a>
            <Link 
              href={selectedPeriod ? `/dashboard/admin/dokumen-rpl/periode/${selectedPeriod}/bundle` : `#`} 
              onClick={(e) => { if(!selectedPeriod) { e.preventDefault(); alert("Pilih periode terlebih dahulu"); } }}
              style={{ padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#1e40af", color: "#fff", textDecoration: "none" }}>
              🖨️ Cetak Bundle Periode
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Mahasiswa</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{totalMahasiswa}</span>
        </div>
        <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #eff6ff, #dbeafe)" }}>
          <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Siap Bundle</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#1d4ed8", marginTop: 8 }}>{siapBundle}</span>
        </div>
        <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #fef2f2, #fee2e2)" }}>
          <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Belum Siap</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#b91c1c", marginTop: 8 }}>{belumSiap}</span>
        </div>
        <div className="md-card" style={{ padding: 20, display: "flex", flexDirection: "column", background: "linear-gradient(to right bottom, #f0fdf4, #dcfce7)" }}>
          <span style={{ fontSize: 13, color: "#166534", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Sudah Cetak</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#166534", marginTop: 8 }}>{sudahCetak}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="md-card" style={{ padding: 20, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 250px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Cari Nama/NIM</label>
          <input 
            type="text" 
            placeholder="Ketik untuk mencari..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
          />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Status Bundle</label>
          <select 
            value={filterBundle}
            onChange={(e) => setFilterBundle(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", backgroundColor: "#fff" }}
          >
            <option value="">-- Semua Status --</option>
            <option value="Belum Siap">Belum Siap</option>
            <option value="Siap Cetak">Siap Cetak</option>
            <option value="Sudah Dicetak">Sudah Dicetak</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="md-card" style={{ overflow: "hidden" }}>
        {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Memuat daftar mahasiswa...</div>}
        
        {!loading && data.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Tidak ada data mahasiswa yang cocok dengan filter.</div>
        )}

        {!loading && data.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#475569" }}>MAHASISWA</th>
                  <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#475569" }}>PERIODE</th>
                  <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#475569" }}>STATUS RPL</th>
                  <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#475569" }}>STATUS BUNDLE</th>
                  <th style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#475569", textAlign: "right" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.mahasiswaId} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="hover-bg-slate-50">
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{item.nama}</div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{item.username}</div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#334155" }}>
                      {item.periode}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: "#f1f5f9", color: "#475569"
                      }}>
                        {item.statusRpl}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 800,
                        background: item.statusBundle === "Siap Cetak" ? "#dbeafe" : item.statusBundle === "Sudah Dicetak" ? "#dcfce7" : "#fee2e2",
                        color: item.statusBundle === "Siap Cetak" ? "#1d4ed8" : item.statusBundle === "Sudah Dicetak" ? "#166534" : "#991b1b"
                      }}>
                        {item.statusBundle}
                      </span>
                      {item.alasanBelumSiap && (
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, maxWidth: 200 }}>{item.alasanBelumSiap}</div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <Link 
                        href={`/dashboard/admin/dokumen-rpl/${item.mahasiswaId}`}
                        style={{
                          display: "inline-block", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                          background: "var(--md-primary)", color: "#fff", textDecoration: "none", transition: "opacity 0.2s"
                        }}
                      >
                        Kelola Dokumen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
