"use client";

import { useState } from "react";
import { saveF02 } from "./actions";

type Matkul = {
  id: string;
  kode: string;
  namaMatkul: string;
  sks: number;
  semester: number;
};

type Profile = {
  name: string;
  nik: string;
  pob: string;
  dob: string;
  gender: string;
};

export default function FormF02Client({
  profile,
  matkulPerSemester,
  pilihanUser,
}: {
  profile: Profile;
  matkulPerSemester: Record<number, Matkul[]>;
  pilihanUser: Record<string, string>;
}) {
  const [selections, setSelections] = useState<Record<string, string>>(pilihanUser);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const semesters = Object.keys(matkulPerSemester)
    .map(Number)
    .sort((a, b) => a - b);

  const handleSelection = (matkulId: string, type: string) => {
    setSelections((prev) => {
      const isCurrentlySelected = prev[matkulId] === type;
      const nextSelections = { ...prev };

      if (isCurrentlySelected) {
        // Toggle off
        delete nextSelections[matkulId];
      } else {
        // Toggle on
        nextSelections[matkulId] = type;
      }
      return nextSelections;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const dataToSave = Object.keys(selections).map((matkulId) => ({
      matkulId,
      jenisPengajuan: selections[matkulId],
    }));

    const result = await saveF02(dataToSave);
    setIsSaving(false);
    setSaveMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  };

  const thStyle: React.CSSProperties = {
    padding: "13px 16px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--md-on-surface-variant)",
    background: "var(--md-surface-2)",
    borderBottom: "1px solid var(--md-outline-variant)",
  };

  return (
    <form onSubmit={handleSave} className="animate-fade-up">
      {/* ── BAGIAN 1: DATA PRIBADI ── */}
      <section className="md-card" style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)", borderBottom: "1px solid #bae6fd" }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 950, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em" }}>BAGIAN 1</p>
          <h2 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)", lineHeight: 1.25 }}>
            Data Calon Mahasiswa
          </h2>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#f8fafc", borderLeft: "4px solid #0ea5e9", borderRadius: "0 12px 12px 0", padding: 16, marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#475569", fontWeight: 600 }}>
              <span style={{ fontSize: 16 }}>ℹ️</span> Data di bawah diambil otomatis dari profil Anda.
            </p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <div style={readOnlyInputStyle}>{profile.name}</div>
            </div>
            <div>
              <label style={labelStyle}>NIK</label>
              <div style={readOnlyInputStyle}>{profile.nik}</div>
            </div>
            <div>
              <label style={labelStyle}>Tempat, Tanggal Lahir</label>
              <div style={readOnlyInputStyle}>{profile.pob}, {profile.dob}</div>
            </div>
            <div>
              <label style={labelStyle}>Jenis Kelamin</label>
              <div style={readOnlyInputStyle}>{profile.gender}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BAGIAN 2: DAFTAR MATA KULIAH ── */}
      <section className="md-card stagger-2" style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)", borderBottom: "1px solid #bae6fd" }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 950, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.12em" }}>BAGIAN 2</p>
          <h2 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 950, color: "var(--md-on-surface)", lineHeight: 1.25 }}>
            Pemilihan Mata Kuliah RPL
          </h2>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: "#f8fafc", borderLeft: "4px solid #eab308", borderRadius: "0 12px 12px 0", padding: 16, marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#475569", fontWeight: 600 }}>
              <span style={{ fontSize: 16 }}>⚠️</span> Beri centang pada kolom yang tersedia untuk mengajukan pengakuan SKS:
              <br/>
              <strong style={{ color: "#0f172a" }}>Transfer:</strong> Berdasarkan ijazah/transkrip dari kampus lama.<br/>
              <strong style={{ color: "#0f172a" }}>Perolehan:</strong> Berdasarkan pengalaman kerja / pelatihan / sertifikasi.
            </p>
          </div>

          {semesters.map((sem) => (
            <div key={sem} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: "var(--md-primary)", marginBottom: 16, borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                Semester {sem}
              </h3>
              
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: 40, textAlign: "center" }}>No</th>
                      <th style={thStyle}>Kode</th>
                      <th style={thStyle}>Nama Mata Kuliah</th>
                      <th style={{ ...thStyle, width: 60, textAlign: "center" }}>SKS</th>
                      <th style={{ ...thStyle, width: 100, textAlign: "center" }}>Transfer</th>
                      <th style={{ ...thStyle, width: 100, textAlign: "center" }}>Perolehan</th>
                      <th style={{ ...thStyle, width: 100, textAlign: "center" }}>Keduanya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matkulPerSemester[sem].map((mk, idx) => {
                      const selectedType = selections[mk.id];
                      return (
                        <tr key={mk.id} style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
                          <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "var(--md-on-surface)" }}>
                            {mk.kode}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)" }}>
                            {mk.namaMatkul}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--md-primary)" }}>
                            {mk.sks}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <input 
                              type="checkbox"
                              checked={selectedType === "Transfer"}
                              onChange={() => handleSelection(mk.id, "Transfer")}
                              style={checkboxStyle}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <input 
                              type="checkbox"
                              checked={selectedType === "Perolehan"}
                              onChange={() => handleSelection(mk.id, "Perolehan")}
                              style={checkboxStyle}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <input 
                              type="checkbox"
                              checked={selectedType === "Keduanya"}
                              onChange={() => handleSelection(mk.id, "Keduanya")}
                              style={checkboxStyle}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>
      </section>

      {saveMessage && (
        <div style={{
          padding: 16, marginBottom: 24, borderRadius: 12, fontWeight: 700, fontSize: 13,
          background: saveMessage.type === "success" ? "#dcfce7" : "#fee2e2",
          color: saveMessage.type === "success" ? "#16a34a" : "#dc2626",
          border: saveMessage.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
        }}>
          {saveMessage.text}
        </div>
      )}

      {/* ── TOMBOL SUBMIT ── */}
      <div className="md-card stagger-3" style={{ padding: 24, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>
          Pastikan pilihan mata kuliah sudah sesuai sebelum disimpan.
        </p>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            background: isSaving ? "#94a3b8" : "var(--md-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "12px 24px",
            fontSize: 13,
            fontWeight: 800,
            cursor: isSaving ? "not-allowed" : "pointer",
            boxShadow: isSaving ? "none" : "0 4px 12px rgba(26,86,219,0.3)",
          }}
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Pengajuan F02"}
        </button>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 10,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const readOnlyInputStyle: React.CSSProperties = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 700,
  color: "#1e293b",
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  cursor: "pointer",
  accentColor: "var(--md-primary)",
};
