"use client";

import { useMemo, useState } from "react";
import { saveF02 } from "./actions";

type Matkul = {
  id: string;
  kode: string;
  namaMatkul: string;
  sks: number;
  semester: number;
  isRpl?: boolean;
};

type Profile = {
  name: string;
  nik: string;
  pob: string;
  dob: string;
  gender: string;
};

const semesterColors: Record<number, { bg: string; soft: string; text: string; border: string }> = {
  1: { bg: "#1a56db", soft: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  2: { bg: "#059669", soft: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  3: { bg: "#dc2626", soft: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  4: { bg: "#d97706", soft: "#fffbeb", text: "#b45309", border: "#fde68a" },
  5: { bg: "#0284c7", soft: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  6: { bg: "#7c3aed", soft: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  7: { bg: "#0f766e", soft: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
  8: { bg: "#334155", soft: "#f8fafc", text: "#334155", border: "#cbd5e1" },
};

export default function FormF02Client({
  profile,
  matkulPerSemester,
  pilihanUser,
  initialConcentration,
  concentrationOptions,
}: {
  profile: Profile;
  matkulPerSemester: Record<number, Matkul[]>;
  pilihanUser: Record<string, string>;
  initialConcentration: string;
  concentrationOptions: string[];
}) {
  const semesters = Object.keys(matkulPerSemester)
    .map(Number)
    .sort((a, b) => a - b);

  const [activeSemester, setActiveSemester] = useState<number>(semesters[0] || 1);
  const [selections, setSelections] = useState<Record<string, string>>(pilihanUser);
  const [concentration, setConcentration] = useState(initialConcentration || "-");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedItems = useMemo(() => {
    const allMatkul = semesters.flatMap((semester) => matkulPerSemester[semester] || []);
    return allMatkul.filter((mk) => selections[mk.id]);
  }, [matkulPerSemester, selections, semesters]);

  const totalSks = selectedItems.reduce((sum, mk) => sum + (Number(mk.sks) || 0), 0);
  const transferCount = selectedItems.filter((mk) => selections[mk.id] === "Transfer").length;
  const perolehanCount = selectedItems.filter((mk) => selections[mk.id] === "Perolehan").length;
  const activeMatkul = matkulPerSemester[activeSemester] || [];

  const handleToggleMatkul = (matkulId: string, checked: boolean) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (checked) {
        next[matkulId] = next[matkulId] || "Perolehan";
      } else {
        delete next[matkulId];
      }
      return next;
    });
  };

  const handleJenisChange = (matkulId: string, jenis: string) => {
    setSelections((prev) => ({
      ...prev,
      [matkulId]: jenis,
    }));
  };

  const handlePilihSemua = (semester: number) => {
    const semesterMatkul = matkulPerSemester[semester] || [];
    const selectable = semesterMatkul.filter((mk) => mk.isRpl !== false);
    const allSelected = selectable.length > 0 && selectable.every((mk) => selections[mk.id]);

    setSelections((prev) => {
      const next = { ...prev };
      selectable.forEach((mk) => {
        if (allSelected) {
          delete next[mk.id];
        } else {
          next[mk.id] = next[mk.id] || "Perolehan";
        }
      });
      return next;
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

    const result = await saveF02(dataToSave, concentration);
    setIsSaving(false);
    setSaveMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  };

  return (
    <form onSubmit={handleSave} className="animate-fade-up" style={{ paddingBottom: 60 }}>
      <section className="md-card" style={{ marginBottom: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "15px 18px", background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)", borderBottom: "1px solid #fed7aa" }}>
          <p style={sectionEyebrow}>Bagian 1</p>
          <h2 style={sectionTitle}>Data Calon Mahasiswa</h2>
        </div>

        <div style={{ padding: 18 }}>
          <div style={noticeStyle}>
            Data di bawah ini diambil otomatis dari menu Biodata dan CV. Jika ada kesalahan, silakan ubah di menu terkait.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            <ReadOnlyField label="Nama Lengkap" value={profile.name} />
            <ReadOnlyField label="NIK" value={profile.nik} />
            <ReadOnlyField label="Tempat, Tanggal Lahir" value={`${profile.pob}, ${profile.dob}`} />
            <ReadOnlyField label="Jenis Kelamin" value={profile.gender} />
          </div>
        </div>
      </section>

      <section className="md-card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.72 }}>Bagian 2</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 950 }}>Pilih Mata Kuliah</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <label style={concentrationWrapStyle}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>
                Konsentrasi
              </span>
              <select value={concentration} onChange={(e) => setConcentration(e.target.value)} style={concentrationSelectStyle}>
                <option value="-">- Umum -</option>
                {concentrationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <SummaryPill label="Dipilih" value={`${selectedItems.length} Matkul`} />
            <SummaryPill label="Total" value={`${totalSks} / 100 SKS`} tone="warning" />
            <SummaryPill label="Transfer" value={`${transferCount}`} />
            <SummaryPill label="Perolehan" value={`${perolehanCount}`} />
          </div>
        </div>

        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--md-outline-variant)", background: "#fff", display: "flex", gap: 8, overflowX: "auto" }}>
          {semesters.map((semester) => {
            const tone = semesterColors[semester] || semesterColors[8];
            const count = (matkulPerSemester[semester] || []).filter((mk) => selections[mk.id]).length;
            const isActive = semester === activeSemester;

            return (
              <button
                key={semester}
                type="button"
                onClick={() => setActiveSemester(semester)}
                style={{
                  border: `1px solid ${isActive ? tone.bg : tone.border}`,
                  background: isActive ? tone.bg : tone.soft,
                  color: isActive ? "#fff" : tone.text,
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 8px 18px rgba(15,23,42,0.16)" : "none",
                }}
              >
                S{semester} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        <div style={{ padding: 14, background: "#f8fafc" }}>
          <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid var(--md-outline-variant)", background: "#fff" }}>
            <div style={{ background: semesterColors[activeSemester]?.bg || "#334155", color: "#fff", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Semester {activeSemester}
              </span>
              <button type="button" onClick={() => handlePilihSemua(activeSemester)} style={smallWhiteButtonStyle}>
                Pilih Semua
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 54, textAlign: "center" }}>No</th>
                    <th style={{ ...thStyle, width: 100, textAlign: "center" }}>Kode</th>
                    <th style={thStyle}>Mata Kuliah</th>
                    <th style={{ ...thStyle, width: 64, textAlign: "center" }}>SKS</th>
                    <th style={{ ...thStyle, width: 90, textAlign: "center" }}>Pilih</th>
                    <th style={{ ...thStyle, width: 220, textAlign: "center" }}>Jenis RPL</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMatkul.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 26, textAlign: "center", color: "#64748b", fontSize: 13, fontWeight: 700 }}>
                        Tidak ada mata kuliah pada semester ini.
                      </td>
                    </tr>
                  ) : (
                    activeMatkul.map((mk, idx) => {
                      const isSelectable = mk.isRpl !== false;
                      const isSelected = Boolean(selections[mk.id]);
                      const rowColor = semesterColors[activeSemester] || semesterColors[8];

                      return (
                        <tr
                          key={mk.id}
                          style={{
                            borderBottom: "1px solid var(--md-outline-variant)",
                            background: !isSelectable ? "#f1f5f9" : isSelected ? rowColor.soft : "#fff",
                            color: !isSelectable ? "#94a3b8" : "var(--md-on-surface)",
                            transition: "background 160ms ease",
                          }}
                        >
                          <td style={tdCenterStyle}>{idx + 1}</td>
                          <td style={{ ...tdCenterStyle, fontFamily: "monospace", fontWeight: 900 }}>{mk.kode}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 850 }}>
                            {mk.namaMatkul}
                            {!isSelectable && (
                              <span style={{ marginLeft: 8, display: "inline-flex", borderRadius: 999, padding: "3px 8px", background: "#e2e8f0", color: "#475569", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}>
                                Wajib Kuliah
                              </span>
                            )}
                          </td>
                          <td style={{ ...tdCenterStyle, fontWeight: 950, color: isSelectable ? rowColor.text : "#94a3b8" }}>{mk.sks}</td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {isSelectable ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleToggleMatkul(mk.id, e.target.checked)}
                                style={checkboxStyle}
                                aria-label={`Pilih ${mk.namaMatkul}`}
                              />
                            ) : (
                              <span style={{ fontWeight: 900 }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {isSelectable ? (
                              <select
                                value={selections[mk.id] || "Perolehan"}
                                disabled={!isSelected}
                                onChange={(e) => handleJenisChange(mk.id, e.target.value)}
                                style={{
                                  ...selectStyle,
                                  opacity: isSelected ? 1 : 0.55,
                                  cursor: isSelected ? "pointer" : "not-allowed",
                                }}
                              >
                                <option value="Perolehan">Perolehan (Kerja)</option>
                                <option value="Transfer">Transfer (Kuliah)</option>
                              </select>
                            ) : (
                              <span style={{ color: "#94a3b8", fontWeight: 800 }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {saveMessage && (
        <div style={{
          padding: 14,
          marginBottom: 18,
          borderRadius: 14,
          fontWeight: 800,
          fontSize: 13,
          background: saveMessage.type === "success" ? "#dcfce7" : "#fee2e2",
          color: saveMessage.type === "success" ? "#166534" : "#991b1b",
          border: saveMessage.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
        }}>
          {saveMessage.text}
        </div>
      )}

      <div style={submitBarStyle}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#475569", fontWeight: 800 }}>
            Pastikan total SKS tidak melebihi 100 SKS.
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b", fontWeight: 650 }}>
            Simpan setelah semua mata kuliah dan jenis RPL sudah sesuai.
          </p>
        </div>
        <button type="submit" disabled={isSaving} style={submitButtonStyle(isSaving)}>
          {isSaving ? "Menyimpan..." : "Simpan Formulir F02"}
        </button>
      </div>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={readOnlyInputStyle}>{value || "-"}</div>
    </div>
  );
}

function SummaryPill({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" }) {
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.24)",
      background: tone === "warning" ? "#fbbf24" : "rgba(255,255,255,0.13)",
      color: tone === "warning" ? "#1e1b00" : "#fff",
      borderRadius: 999,
      padding: "7px 12px",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.76 }}>{label}</span>
      <strong style={{ fontSize: 12, fontWeight: 950 }}>{value}</strong>
    </div>
  );
}

const sectionEyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  fontWeight: 950,
  color: "#d97706",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const sectionTitle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 18,
  fontWeight: 950,
  color: "var(--md-on-surface)",
  lineHeight: 1.25,
};

const noticeStyle: React.CSSProperties = {
  background: "#f8fafc",
  borderLeft: "4px solid #0ea5e9",
  borderRadius: "0 12px 12px 0",
  padding: 13,
  marginBottom: 16,
  fontSize: 12,
  color: "#475569",
  fontWeight: 650,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: 10,
  fontWeight: 850,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const readOnlyInputStyle: React.CSSProperties = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "10px 13px",
  fontSize: 13,
  fontWeight: 750,
  color: "#1e293b",
  minHeight: 42,
};

const thStyle: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
  background: "#f8fafc",
  borderBottom: "1px solid var(--md-outline-variant)",
  whiteSpace: "nowrap",
};

const tdCenterStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "center",
  fontSize: 12,
  fontWeight: 800,
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  cursor: "pointer",
  accentColor: "#16a34a",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 36,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1e293b",
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 800,
  outline: "none",
};

const concentrationWrapStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.13)",
  borderRadius: 999,
  padding: "5px 6px 5px 12px",
  color: "#fff",
};

const concentrationSelectStyle: React.CSSProperties = {
  minWidth: 180,
  height: 32,
  borderRadius: 999,
  border: "none",
  background: "#fff",
  color: "#0f172a",
  padding: "0 12px",
  fontSize: 12,
  fontWeight: 900,
  outline: "none",
  cursor: "pointer",
};

const smallWhiteButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.45)",
  background: "rgba(255,255,255,0.95)",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const submitBarStyle: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  zIndex: 20,
  marginTop: 18,
  padding: 14,
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 18,
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 -8px 24px rgba(15,23,42,0.10)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  backdropFilter: "blur(8px)",
};

function submitButtonStyle(isSaving: boolean): React.CSSProperties {
  return {
    background: isSaving ? "#94a3b8" : "var(--md-primary)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "12px 24px",
    fontSize: 13,
    fontWeight: 900,
    cursor: isSaving ? "not-allowed" : "pointer",
    boxShadow: isSaving ? "none" : "0 8px 18px rgba(26,86,219,0.24)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
}
