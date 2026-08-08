"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomSelect, CustomInput } from "@/components/dashboard/CustomSelect";

type PlottingData = {
  plottingId: string | null;
  mahasiswaId: string;
  mahasiswaNama: string;
  username: string;
  klasterId: string;
  klasterName: string;
  assessmentStatus: string;
  certificateNumber: string | null;
  f03Status: "Belum Diisi" | "Sebagian" | "Lengkap";
  plottingStatus: "Belum Diplotting" | "Sudah Diplotting";
  penilaiId: string | null;
  penilaiNama: string;
};

type KlasterData = {
  id: string;
  nama: string;
};

type PenilaiData = {
  _id: string;
  name: string;
  username: string;
};

export default function PlottingF03Page() {
  const router = useRouter();
  const [dataList, setDataList] = useState<PlottingData[]>([]);
  const [klasterList, setKlasterList] = useState<KlasterData[]>([]);
  const [isSkFinal, setIsSkFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Filters
  const [filterKlasterId, setFilterKlasterId] = useState("");
  const [filterStatusPlotting, setFilterStatusPlotting] = useState("Semua");
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState<PlottingData | null>(null);
  const [availablePenilai, setAvailablePenilai] = useState<PenilaiData[]>([]);
  const [loadingPenilai, setLoadingPenilai] = useState(false);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [autoResult, setAutoResult] = useState<any>(null);

  useEffect(() => {
    fetchKlasters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterKlasterId, filterStatusPlotting, search]);

  const fetchKlasters = async () => {
    try {
      const res = await fetch("/api/akademik/klaster");
      if (res.ok) {
        const json = await res.json();
        setKlasterList(json || []);
      }
    } catch (err) {
      console.error("Gagal mengambil klaster", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterKlasterId) params.append("klasterId", filterKlasterId);
      if (filterStatusPlotting !== "Semua") params.append("statusPlotting", filterStatusPlotting);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/plotting-f03?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data plotting");
      const json = await res.json();
      setDataList(json.data || []);
      setIsSkFinal(json.isSkFinal || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
    fetchData();
  };

  const openPlottingModal = async (item: PlottingData) => {
    setShowModal(item);
    setAvailablePenilai([]);
    setLoadingPenilai(true);
    try {
      const res = await fetch(`/api/admin/plotting-f03/penilai?klasterId=${item.klasterId}`);
      if (!res.ok) throw new Error("Gagal load penilai");
      const json = await res.json();
      setAvailablePenilai(json.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat daftar penilai sesuai klaster.");
    } finally {
      setLoadingPenilai(false);
    }
  };

  const handlePlottingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showModal) return;

    const formData = new FormData(e.currentTarget);
    const penilaiId = formData.get("penilaiId");
    const catatanAdmin = formData.get("catatanAdmin");

    if (!penilaiId) {
      alert("Pilih penilai terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch("/api/admin/plotting-f03", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mahasiswaId: showModal.mahasiswaId,
          klasterId: showModal.klasterId,
          penilaiId,
          catatanAdmin,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan plotting");

      setShowModal(null);
      showSuccess("Plotting berhasil disimpan");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAutoPlotting = async () => {
    if (!confirm("Jalankan Auto Plotting? Sistem akan membagi rata sisa mahasiswa yang belum diplotting ke penilai yang eligible.")) return;
    
    try {
      setLoadingAuto(true);
      const res = await fetch("/api/admin/plotting-f03/auto-plot", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal auto plotting");
      
      setAutoResult(json.data);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAuto(false);
    }
  };

  const inputStyle = { padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" };
  const btnStyle = { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" };
  const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
  const modalContentStyle: React.CSSProperties = { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Plotting F03"
        title="Plotting F03 Mahasiswa"
        subtitle="Tugaskan mahasiswa yang telah mengisi F03 kepada penilai sesuai klaster kompetensi."
        tone="warning"
      />

      {message && (
        <div style={{ padding: 16, background: "#d1fae5", color: "#065f46", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!isSkFinal && !loading && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
          <span>⚠️</span>
          <span>SK Penilai RPL periode aktif belum final. Plotting manual dan auto plotting belum dapat dilakukan. Lengkapi dan Finalisasi SK Penilai RPL di menu SK Generator terlebih dahulu.</span>
        </div>
      )}

      {/* AUTO PLOTTING BUTTON */}
      <div style={{ marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <button 
          onClick={handleAutoPlotting} 
          disabled={!isSkFinal || loadingAuto}
          style={{ ...btnStyle, background: (!isSkFinal || loadingAuto) ? "#cbd5e1" : "#1d4ed8", color: "#fff", padding: "12px 24px" }}
        >
          {loadingAuto ? "Memproses Auto Plotting..." : "⚡ Jalankan Auto Plotting"}
        </button>
        <div style={{ display: "flex", gap: 12 }}>
           <span style={{ fontSize: 13, fontWeight: 700, padding: "6px 12px", background: isSkFinal ? "#dcfce7" : "#fee2e2", color: isSkFinal ? "#166534" : "#991b1b", borderRadius: 16 }}>
             Status SK Penilai: {isSkFinal ? "FINAL" : "Belum Final"}
           </span>
           <span style={{ fontSize: 13, fontWeight: 700, padding: "6px 12px", background: "#f1f5f9", color: "#475569", borderRadius: 16 }}>
             Mahasiswa Menunggu: {dataList.filter(d => d.plottingStatus === "Belum Diplotting").length}
           </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="md-card animate-fade-up" style={{ padding: 12, marginBottom: 20, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", alignItems: "stretch" }}>
        <CustomSelect
          icon="P"
          label="Klaster"
          value={filterKlasterId}
          onChange={setFilterKlasterId}
          options={[
            { value: "", label: "Semua Klaster" },
            ...klasterList.map(k => ({ value: k.id, label: k.nama }))
          ]}
        />
        
        <CustomSelect
          icon="S"
          label="Status Plotting"
          value={filterStatusPlotting}
          onChange={setFilterStatusPlotting}
          options={[
            { value: "Semua", label: "Semua Status Plotting" },
            { value: "Belum Diplotting", label: "Belum Diplotting" },
            { value: "Sudah Diplotting", label: "Sudah Diplotting" }
          ]}
        />

        <CustomInput
          icon="C"
          label="Pencarian"
          value={search}
          onChange={setSearch}
          placeholder="Cari nama atau NIM mahasiswa..."
        />
      </div>

      <div className="md-card" style={{ padding: 24, overflowX: "auto" }}>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "#64748b" }}>
                <th style={{ padding: 16 }}>Mahasiswa</th>
                <th style={{ padding: 16 }}>Klaster</th>
                <th style={{ padding: 16 }}>Status Tes</th>
                <th style={{ padding: 16 }}>Status F03</th>
                <th style={{ padding: 16 }}>Status Plotting</th>
                <th style={{ padding: 16 }}>Penilai Saat Ini</th>
                <th style={{ padding: 16, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map(item => (
                <tr key={`${item.mahasiswaId}-${item.klasterId}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.mahasiswaNama}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.username}</div>
                  </td>
                  <td style={{ padding: 16, fontWeight: 700, color: "#334155" }}>
                    {item.klasterName}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {item.assessmentStatus}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: item.f03Status === "Lengkap" ? "#dcfce7" : item.f03Status === "Sebagian" ? "#fef08a" : "#f1f5f9", 
                      color: item.f03Status === "Lengkap" ? "#166534" : item.f03Status === "Sebagian" ? "#854d0e" : "#475569", 
                      borderRadius: 6, fontSize: 11, fontWeight: 700 
                    }}>
                      {item.f03Status}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: item.plottingStatus === "Sudah Diplotting" ? "#dbeafe" : "#fee2e2", 
                      color: item.plottingStatus === "Sudah Diplotting" ? "#1e40af" : "#991b1b",
                      borderRadius: 6, fontSize: 11, fontWeight: 700 
                    }}>
                      {item.plottingStatus}
                    </span>
                  </td>
                  <td style={{ padding: 16, fontWeight: 700, color: item.penilaiId ? "#0f172a" : "#94a3b8" }}>
                    {item.penilaiNama}
                  </td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <button 
                      onClick={() => openPlottingModal(item)}
                      disabled={!isSkFinal}
                      style={{ 
                        ...btnStyle, 
                        background: !isSkFinal ? "#f1f5f9" : item.plottingStatus === "Sudah Diplotting" ? "#f8fafc" : "var(--md-primary)", 
                        color: !isSkFinal ? "#94a3b8" : item.plottingStatus === "Sudah Diplotting" ? "#475569" : "#fff",
                        border: item.plottingStatus === "Sudah Diplotting" ? "1px solid #e2e8f0" : "none",
                        cursor: !isSkFinal ? "not-allowed" : "pointer"
                      }}
                    >
                      {item.plottingStatus === "Sudah Diplotting" ? "Ubah Penilai" : "Plotting Penilai"}
                    </button>
                  </td>
                </tr>
              ))}
              {dataList.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                    Tidak ada data mahasiswa yang siap diplotting sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PLOTTING */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>Plotting Penilai</h3>
            <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#475569" }}>
              <p><strong>Mahasiswa:</strong> {showModal.mahasiswaNama} ({showModal.username})</p>
              <p><strong>Klaster:</strong> {showModal.klasterName}</p>
            </div>
            
            <form onSubmit={handlePlottingSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#334155" }}>Pilih Penilai</label>
                {loadingPenilai ? (
                  <p style={{ fontSize: 13, color: "#64748b" }}>Memuat penilai...</p>
                ) : availablePenilai.length > 0 ? (
                  <select name="penilaiId" required style={{ ...inputStyle, width: "100%" }} defaultValue={showModal.penilaiId || ""}>
                    <option value="" disabled>-- Pilih Penilai Sesuai Klaster --</option>
                    {availablePenilai.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.username})</option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>Belum ada penilai yang dimapping pada klaster ini. Silakan atur Manajemen Penilai terlebih dahulu.</p>
                )}
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#334155" }}>Catatan Admin (Opsional)</label>
                <textarea 
                  name="catatanAdmin" 
                  rows={3} 
                  style={{ ...inputStyle, width: "100%", resize: "none" }}
                  placeholder="Catatan internal..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(null)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Batal</button>
                <button type="submit" disabled={availablePenilai.length === 0} style={{ ...btnStyle, background: availablePenilai.length === 0 ? "#cbd5e1" : "var(--md-primary)", color: "#fff" }}>
                  Simpan Plotting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTO RESULT MODAL */}
      {autoResult && (
         <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
             <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>Laporan Auto Plotting</h3>
             <ul style={{ fontSize: 14, marginBottom: 16, lineHeight: "1.6" }}>
                <li><strong>Total Kandidat:</strong> {autoResult.totalCandidate} klaster</li>
                <li><strong>Berhasil Di-Assign:</strong> {autoResult.totalAssigned} klaster</li>
                <li><strong>Gagal / Skipped:</strong> {autoResult.totalSkipped} klaster</li>
             </ul>

             {autoResult.skippedDetails.length > 0 && (
                <div style={{ background: "#fee2e2", padding: 12, borderRadius: 8, maxHeight: 200, overflowY: "auto", fontSize: 13, marginBottom: 16 }}>
                   <p style={{ fontWeight: 700, color: "#991b1b", margin: "0 0 8px 0" }}>Rincian Gagal (Skipped):</p>
                   <ul style={{ margin: 0, paddingLeft: 16, color: "#991b1b" }}>
                     {autoResult.skippedDetails.map((s: any, idx: number) => (
                       <li key={idx}>Klaster {s.klasterId} - {s.reason}</li>
                     ))}
                   </ul>
                </div>
             )}

             <button onClick={() => setAutoResult(null)} style={{ ...btnStyle, background: "var(--md-primary)", color: "#fff", width: "100%" }}>
                Tutup Laporan
             </button>
          </div>
         </div>
      )}
    </div>
  );
}
