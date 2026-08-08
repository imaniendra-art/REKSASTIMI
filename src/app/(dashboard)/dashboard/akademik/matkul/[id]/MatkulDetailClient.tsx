"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CpmkType = {
  id: string;
  nomorUrut: number;
  deskripsiCpmk: string;
};

type MatkulDetailProps = {
  matkul: {
    id: string;
    kode: string;
    namaMatkul: string;
    sks: number;
    semester: number;
    deskripsi: string;
  };
  initialCpmkList: CpmkType[];
};

const accentColor = "#059669";
const accentSoft = "#ecfdf5";
const accentBorder = "#a7f3d0";

export default function MatkulDetailClient({ matkul, initialCpmkList }: MatkulDetailProps) {
  const router = useRouter();
  const [deskripsi, setDeskripsi] = useState(matkul.deskripsi || "");
  const [cpmkList, setCpmkList] = useState<CpmkType[]>(initialCpmkList);
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCpmkUrut, setNewCpmkUrut] = useState(cpmkList.length + 1);
  const [newCpmkDesc, setNewCpmkDesc] = useState("");
  const [isSavingCpmk, setIsSavingCpmk] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const sortedCpmkList = [...cpmkList].sort((a, b) => a.nomorUrut - b.nomorUrut);

  const handleSaveDeskripsi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDesc(true);
    try {
      const res = await fetch(`/api/akademik/matkul/${matkul.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deskripsi }),
      });
      if (res.ok) {
        alert("Deskripsi berhasil disimpan.");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan deskripsi.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsSavingDesc(false);
  };

  const handleAddCpmk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCpmkDesc.trim()) return;

    setIsSavingCpmk(true);
    try {
      const res = await fetch(`/api/akademik/matkul/${matkul.id}/cpmk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorUrut: newCpmkUrut,
          deskripsiCpmk: newCpmkDesc,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCpmkList((prev) => [
          ...prev,
          {
            id: data.data._id,
            nomorUrut: data.data.nomorUrut,
            deskripsiCpmk: data.data.deskripsiCpmk,
          },
        ]);
        setNewCpmkUrut((prev) => prev + 1);
        setNewCpmkDesc("");
        setIsModalOpen(false);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menambah CPMK.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsSavingCpmk(false);
  };

  const handleDeleteCpmk = async (cpmkId: string) => {
    if (!confirm("Yakin ingin menghapus CPMK ini?")) return;

    setIsDeletingId(cpmkId);
    try {
      const res = await fetch(`/api/akademik/cpmk/${cpmkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCpmkList((prev) => prev.filter((c) => c.id !== cpmkId));
        router.refresh();
      } else {
        alert("Gagal menghapus CPMK.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
    setIsDeletingId(null);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 14, alignItems: "start" }}>
      <section className="md-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", borderBottom: `1px solid ${accentBorder}` }}>
          <p style={eyebrowStyle}>Profil Mata Kuliah</p>
          <h2 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)", lineHeight: 1.25 }}>
            {matkul.namaMatkul}
          </h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={pillStyle}>{matkul.kode}</span>
            <span style={pillStyle}>{matkul.sks} SKS</span>
            <span style={pillStyle}>Semester {matkul.semester}</span>
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <MiniStat label="CPMK" value={String(cpmkList.length)} />
            <MiniStat label="Status" value="Aktif RPL" />
          </div>

          <form onSubmit={handleSaveDeskripsi}>
            <label style={labelStyle}>Deskripsi & Tujuan Mata Kuliah</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={9}
              placeholder="Tuliskan deskripsi kompetensi utama mata kuliah ini..."
              style={textareaStyle}
            />
            <p style={{ marginTop: 8, marginBottom: 12, fontSize: 11, color: "#64748b", fontWeight: 650, lineHeight: 1.5 }}>
              Deskripsi ini menjadi panduan mahasiswa saat mengisi evaluasi diri F-03.
            </p>
            <button type="submit" disabled={isSavingDesc} style={primaryButtonStyle(isSavingDesc)}>
              {isSavingDesc ? "Menyimpan..." : "Simpan Deskripsi"}
            </button>
          </form>
        </div>
      </section>

      <section className="md-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--md-outline-variant)", background: "#fff" }}>
          <div>
            <p style={eyebrowStyle}>Capaian Pembelajaran</p>
            <h2 style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 950, color: "var(--md-on-surface)" }}>
              Daftar CPMK
            </h2>
          </div>
          <button
            onClick={() => {
              setNewCpmkUrut(cpmkList.length + 1);
              setNewCpmkDesc("");
              setIsModalOpen(true);
            }}
            type="button"
            style={outlineButtonStyle}
          >
            Tambah CPMK
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--md-outline-variant)" }}>
                <th style={{ ...thStyle, width: 120, textAlign: "center" }}>Ref</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Capaian Pembelajaran</th>
                <th style={{ ...thStyle, width: 110, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedCpmkList.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "34px 16px", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, margin: "0 auto 8px", borderRadius: 14, background: accentSoft, color: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 950 }}>
                      CP
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                      Belum ada CPMK
                    </p>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 650, color: "#94a3b8" }}>
                      Tambahkan capaian pembelajaran sebagai dasar penilaian RPL.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedCpmkList.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 160ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ background: accentSoft, color: accentColor, border: `1px solid ${accentBorder}`, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 900 }}>
                        CPMK-{c.nomorUrut}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e293b", fontWeight: 650, lineHeight: 1.55 }}>
                      {c.deskripsiCpmk}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteCpmk(c.id)}
                        disabled={isDeletingId === c.id}
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
                          cursor: isDeletingId === c.id ? "not-allowed" : "pointer",
                          opacity: isDeletingId === c.id ? 0.55 : 1,
                        }}
                      >
                        {isDeletingId === c.id ? "..." : "Hapus"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.42)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 520, borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(15,23,42,0.22)" }}>
            <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #047857, #10b981)", color: "#fff" }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", opacity: 0.82 }}>CPMK Baru</p>
                <h3 style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 950 }}>Tambah Capaian Pembelajaran</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} type="button" style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.16)", color: "#fff", fontSize: 18, cursor: "pointer" }}>
                x
              </button>
            </div>
            <form onSubmit={handleAddCpmk}>
              <div style={{ padding: 18, background: "#f8fafc" }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "start" }}>
                  <div>
                    <label style={labelStyle}>Urutan</label>
                    <input
                      type="number"
                      value={newCpmkUrut}
                      onChange={(e) => setNewCpmkUrut(parseInt(e.target.value) || 1)}
                      required
                      min={1}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Deskripsi CPMK</label>
                    <textarea
                      value={newCpmkDesc}
                      onChange={(e) => setNewCpmkDesc(e.target.value)}
                      required
                      rows={5}
                      placeholder="Contoh: Mampu menganalisis konsep utama mata kuliah sesuai pengalaman kerja."
                      style={{ ...textareaStyle, minHeight: 128 }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 18px", background: "#fff", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--md-outline-variant)" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={secondaryButtonStyle}>
                  Batal
                </button>
                <button type="submit" disabled={isSavingCpmk} style={primaryButtonStyle(isSavingCpmk)}>
                  {isSavingCpmk ? "Menyimpan..." : "Simpan CPMK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 12, background: "#fff", border: "1px solid var(--md-outline-variant)", padding: "10px 12px" }}>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ margin: "5px 0 0", fontSize: 13, fontWeight: 950, color: "var(--md-on-surface)" }}>{value}</p>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  fontWeight: 950,
  color: accentColor,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 10,
  fontWeight: 900,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  background: "#fff",
  border: `1px solid ${accentBorder}`,
  color: accentColor,
  padding: "5px 10px",
  fontSize: 10,
  fontWeight: 900,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 170,
  padding: "12px 13px",
  borderRadius: 12,
  border: "1px solid var(--md-outline-variant)",
  background: "#fff",
  color: "#1e293b",
  fontSize: 12,
  fontWeight: 650,
  lineHeight: 1.55,
  resize: "vertical",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid var(--md-outline-variant)",
  background: "#fff",
  color: "#1e293b",
  fontSize: 14,
  fontWeight: 900,
  textAlign: "center",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "9px 12px",
  fontSize: 9,
  fontWeight: 950,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  whiteSpace: "nowrap",
};

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    border: "none",
    borderRadius: 999,
    background: disabled ? "#94a3b8" : accentColor,
    color: "#fff",
    padding: "10px 16px",
    minHeight: 40,
    fontSize: 11,
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 4px 12px rgba(5,150,105,0.24)",
  };
}

const outlineButtonStyle: React.CSSProperties = {
  border: `1px solid ${accentBorder}`,
  borderRadius: 999,
  background: accentSoft,
  color: accentColor,
  padding: "8px 14px",
  fontSize: 11,
  fontWeight: 950,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 999,
  background: "#fff",
  color: "var(--md-on-surface-variant)",
  padding: "10px 16px",
  minHeight: 40,
  fontSize: 11,
  fontWeight: 950,
  cursor: "pointer",
};
