"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Matkul = {
  id: string;
  kode: string;
  nama: string;
  sks: number;
};

type DetailKlasterClientProps = {
  klaster: {
    id: string;
    nama: string;
    deskripsi: string;
  };
  matkulIsi: Matkul[];
  matkulTersedia: Matkul[];
};

export default function DetailKlasterClient({ klaster, matkulIsi, matkulTersedia }: DetailKlasterClientProps) {
  const router = useRouter();
  
  const [deskripsi, setDeskripsi] = useState(klaster.deskripsi);
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  
  const [selectedMatkul, setSelectedMatkul] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);

  const handleSaveDeskripsi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDesc(true);
    try {
      const res = await fetch(`/api/akademik/klaster/${klaster.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deskripsi }),
      });
      if (res.ok) {
        alert("Deskripsi klaster berhasil disimpan!");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan deskripsi");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsSavingDesc(false);
  };

  const handleAddMatkul = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatkul) return;
    
    setIsAdding(true);
    try {
      const res = await fetch(`/api/akademik/klaster/${klaster.id}/matkul`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matkulId: selectedMatkul }),
      });
      if (res.ok) {
        setSelectedMatkul("");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menautkan mata kuliah");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsAdding(false);
  };

  const handleRemoveMatkul = async (matkulId: string, nama: string) => {
    if (!confirm(`Yakin ingin mengeluarkan ${nama} dari klaster ini?`)) return;
    
    setIsRemovingId(matkulId);
    try {
      const res = await fetch(`/api/akademik/klaster/${klaster.id}/matkul?matkulId=${matkulId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal melepas mata kuliah");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsRemovingId(null);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, flexDirection: "row-reverse" }}>
      
      {/* Right Column: Descriptions & Add Course Form */}
      <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: 14 }}>
        
        {/* Deskripsi Klaster */}
        <section className="md-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)", borderBottom: "1px solid #bae6fd" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 950, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em" }}>Profil Klaster</p>
            <h2 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)", lineHeight: 1.25 }}>
              Deskripsi & Tujuan
            </h2>
          </div>
          
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16, lineHeight: 1.6, fontWeight: 650 }}>
              Gunakan deskripsi ini untuk memberikan konteks akademik pada SK Lampiran dan panduan pemetaan.
            </p>
            <form onSubmit={handleSaveDeskripsi}>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Masukkan deskripsi klaster..."
                rows={4}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--md-outline-variant)", background: "#fff", fontSize: 13, fontWeight: 650, color: "#1e293b", resize: "none", outline: "none", marginBottom: 12 }}
              />
              <button
                type="submit"
                disabled={isSavingDesc}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 999,
                  background: isSavingDesc ? "#94a3b8" : "#0ea5e9",
                  color: "#fff",
                  padding: "10px 16px",
                  minHeight: 40,
                  fontSize: 11,
                  fontWeight: 950,
                  cursor: isSavingDesc ? "not-allowed" : "pointer",
                  boxShadow: isSavingDesc ? "none" : "0 4px 12px rgba(14,165,233,0.24)",
                }}
              >
                {isSavingDesc ? "Menyimpan..." : "Simpan Deskripsi"}
              </button>
            </form>
          </div>
        </section>

        {/* Tautkan Matkul */}
        <section className="md-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)", borderBottom: "1px solid #bae6fd" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 950, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em" }}>Aksi</p>
            <h2 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)", lineHeight: 1.25 }}>
              Tautkan Matkul
            </h2>
          </div>
          
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 16, lineHeight: 1.6, fontWeight: 650 }}>
              Pilih mata kuliah RPL yang belum tertaut ke klaster manapun.
            </p>
            <form onSubmit={handleAddMatkul}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Mata Kuliah Tersedia
                </label>
                
                {matkulTersedia.length > 0 ? (
                  <div
                    style={{ position: "relative" }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        minHeight: 54,
                        borderRadius: 18,
                        border: dropdownOpen ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                        background: dropdownOpen ? "#fff" : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        padding: "8px 12px",
                        boxShadow: dropdownOpen ? "0 0 0 3px rgba(26,86,219,0.12)" : "0 1px 2px rgba(15,23,42,0.04)",
                        transition: "border-color 180ms, box-shadow 180ms, background 180ms",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: "#f0f9ff", color: "#0ea5e9", fontSize: 10, fontWeight: 950, flexShrink: 0
                      }}>
                        M
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "block", marginBottom: 2, fontSize: 9, fontWeight: 950, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em" }}>Pilih Matkul</span>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: 850, color: "var(--md-on-surface)" }}>
                          {selectedMatkul ? matkulTersedia.find(m => m.id === selectedMatkul)?.nama : "Belum Dipilih"}
                        </span>
                      </span>
                      <span style={{
                        width: 22, height: 22, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: "#fff", border: "1px solid var(--md-outline-variant)", color: "#64748b", fontSize: 10, fontWeight: 950, flexShrink: 0,
                        transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms"
                      }}>
                        v
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div style={{
                        position: "absolute", zIndex: 30, top: "calc(100% + 8px)", left: 0, right: 0, maxHeight: 260, overflowY: "auto",
                        borderRadius: 18, border: "1px solid var(--md-outline-variant)", background: "#fff", boxShadow: "0 18px 40px rgba(15,23,42,0.16)", padding: 6
                      }}>
                        {matkulTersedia.map((m) => {
                          const active = m.id === selectedMatkul;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setSelectedMatkul(m.id); setDropdownOpen(false); }}
                              style={{
                                width: "100%", minHeight: 36, borderRadius: 12, border: active ? "1px solid #bae6fd" : "1px solid transparent",
                                padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 850, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                                background: active ? "#f0f9ff" : "transparent", color: active ? "#0ea5e9" : "var(--md-on-surface)",
                              }}
                            >
                              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {m.kode} - {m.nama}
                              </span>
                              {active && <span style={{ width: 8, height: 8, borderRadius: 999, background: "#0ea5e9", boxShadow: "0 0 0 3px rgba(14,165,233,0.12)", flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, display: "flex", gap: 10, alignItems: "center", color: "#16a34a" }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>
                      Semua matkul RPL sudah masuk klaster.
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isAdding || matkulTersedia.length === 0}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 999,
                  background: (isAdding || matkulTersedia.length === 0) ? "#94a3b8" : "#0ea5e9",
                  color: "#fff",
                  padding: "10px 16px",
                  minHeight: 40,
                  fontSize: 11,
                  fontWeight: 950,
                  cursor: (isAdding || matkulTersedia.length === 0) ? "not-allowed" : "pointer",
                  boxShadow: (isAdding || matkulTersedia.length === 0) ? "none" : "0 4px 12px rgba(14,165,233,0.24)",
                }}
              >
                {isAdding ? "Memproses..." : "Masukkan Ke Klaster"}
              </button>
            </form>
          </div>
        </section>

        {/* Info Integritas Data */}
        <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "flex", gap: 12, alignItems: "flex-start", color: "#64748b" }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div>
            <h6 style={{ margin: "0 0 4px 0", fontWeight: 900, fontSize: 12 }}>Integritas Data</h6>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, fontWeight: 600 }}>
              Pemetaan klaster digunakan untuk <strong>plotting penilai</strong>. Pastikan matkul berada di rumpun ilmu yang tepat.
            </p>
          </div>
        </div>
      </div>

      {/* Left Column: Current Courses */}
      <div style={{ flex: "2 1 450px" }}>
        <section className="md-card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--md-outline-variant)", background: "#fff" }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 950, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em" }}>📦 ISI KLASTER</p>
              <h2 style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 950, color: "var(--md-on-surface)" }}>
                Daftar Mata Kuliah
              </h2>
            </div>
            <span style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0284c7", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 900 }}>
              {matkulIsi.length} Terdaftar
            </span>
          </div>

          <div style={{ flex: 1, padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--md-outline-variant)" }}>
                    <th style={{ padding: "9px 12px", fontSize: 9, fontWeight: 950, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "15%", whiteSpace: "nowrap" }}>KODE</th>
                    <th style={{ padding: "9px 12px", fontSize: 9, fontWeight: 950, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "50%", whiteSpace: "nowrap" }}>NAMA MATA KULIAH</th>
                    <th style={{ padding: "9px 12px", fontSize: 9, fontWeight: 950, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%", whiteSpace: "nowrap" }}>SKS</th>
                    <th style={{ padding: "9px 12px", fontSize: 9, fontWeight: 950, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "25%", whiteSpace: "nowrap" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {matkulIsi.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "34px 16px", textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, margin: "0 auto 8px", borderRadius: 14, background: "#e0f2fe", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 950 }}>📂</div>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>Klaster Kosong</p>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 650, color: "#94a3b8" }}>Belum ada mata kuliah yang ditautkan ke dalam klaster ini.</p>
                      </td>
                    </tr>
                  ) : (
                    matkulIsi.map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 160ms" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontFamily: "monospace", background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 900 }}>
                            {m.kode}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e293b", fontWeight: 650, lineHeight: 1.55 }}>
                          {m.nama}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ background: "#fff", border: "1px solid var(--md-outline-variant)", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "#334155", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                            {m.sks}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleRemoveMatkul(m.id, m.nama)}
                            disabled={isRemovingId === m.id}
                            type="button"
                            style={{
                              minWidth: 58,
                              height: 28,
                              borderRadius: 999,
                              border: "1px solid #fecdd3",
                              background: "#fff",
                              color: "#e11d48",
                              fontSize: 10,
                              fontWeight: 900,
                              cursor: isRemovingId === m.id ? "not-allowed" : "pointer",
                              opacity: isRemovingId === m.id ? 0.55 : 1,
                            }}
                          >
                            {isRemovingId === m.id ? "..." : "Lepas"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      
    </div>
  );
}
