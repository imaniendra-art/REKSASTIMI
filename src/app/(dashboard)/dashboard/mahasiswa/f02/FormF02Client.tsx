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
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 60, marginTop: 24 }}>
      {/* ── Bagian 1: Data Mahasiswa ── */}
      <section
        style={{
          borderRadius: 20,
          background: "var(--md-surface-1)",
          border: "1px solid var(--md-outline-variant)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 22px", background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-primary)" }}>
            Bagian 1
          </p>
          <h2 style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)" }}>
            Data Pemohon RPL (Sesuai Biodata)
          </h2>
        </div>

        <div style={{ padding: 22 }}>
          <div
            style={{
              background: "var(--md-surface-2)",
              borderLeft: "4px solid var(--md-primary)",
              borderRadius: "0 10px 10px 0",
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: "var(--md-on-surface-variant)",
              fontWeight: 600,
            }}
          >
            Data diri di bawah ini disinkronkan otomatis dari menu Biodata. Jika terdapat koreksi, perbarui pada halaman Biodata.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <ReadOnlyField label="Nama Lengkap" value={profile.name} />
            <ReadOnlyField label="NIK / KTP" value={profile.nik} />
            <ReadOnlyField label="Tempat, Tanggal Lahir" value={`${profile.pob}, ${profile.dob}`} />
            <ReadOnlyField label="Jenis Kelamin" value={profile.gender === "L" ? "Laki-laki" : profile.gender === "P" ? "Perempuan" : profile.gender} />
          </div>
        </div>
      </section>

      {/* ── Bagian 2: Pemilihan Mata Kuliah ── */}
      <section
        style={{
          borderRadius: 20,
          background: "var(--md-surface-1)",
          border: "1px solid var(--md-outline-variant)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            background: "linear-gradient(135deg, var(--md-surface-1) 0%, var(--md-surface-2) 100%)",
            borderBottom: "1px solid var(--md-outline-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--md-primary)" }}>
              Bagian 2
            </p>
            <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 900, color: "var(--md-on-surface)" }}>
              Klaim Mata Kuliah Konversi RPL
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--md-outline)",
                background: "var(--md-surface-1)",
                borderRadius: 999,
                padding: "4px 8px 4px 12px",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--md-on-surface-variant)" }}>
                Konsentrasi:
              </span>
              <select
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                style={{
                  height: 30,
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  color: "var(--md-on-surface)",
                  fontSize: 12,
                  fontWeight: 800,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="-">- Umum -</option>
                {concentrationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <SummaryPill label="Mata Kuliah" value={`${selectedItems.length}`} />
            <SummaryPill label="Total Klaim" value={`${totalSks} / 100 SKS`} highlight />
            <SummaryPill label="Transfer" value={`${transferCount}`} />
            <SummaryPill label="Perolehan" value={`${perolehanCount}`} />
          </div>
        </div>

        {/* Semester Navigator Tabs */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--md-outline-variant)",
            background: "var(--md-surface-2)",
            display: "flex",
            gap: 8,
            overflowX: "auto",
          }}
        >
          {semesters.map((semester) => {
            const count = (matkulPerSemester[semester] || []).filter((mk) => selections[mk.id]).length;
            const isActive = semester === activeSemester;

            return (
              <button
                key={semester}
                type="button"
                onClick={() => setActiveSemester(semester)}
                style={{
                  border: isActive ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                  background: isActive ? "var(--md-primary)" : "var(--md-surface-1)",
                  color: isActive ? "var(--md-on-primary)" : "var(--md-on-surface)",
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.16s ease",
                  boxShadow: isActive ? "0 4px 12px var(--theme-glow)" : "none",
                }}
              >
                Semester {semester} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Table Container */}
        <div style={{ padding: 18 }}>
          <div style={{ overflow: "hidden", borderRadius: 14, border: "1px solid var(--md-outline-variant)", background: "var(--md-surface-1)" }}>
            <div
              style={{
                background: "var(--md-surface-2)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderBottom: "1px solid var(--md-outline-variant)",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-on-surface)" }}>
                Daftar Mata Kuliah Semester {activeSemester}
              </span>
              <button
                type="button"
                onClick={() => handlePilihSemua(activeSemester)}
                style={{
                  border: "1px solid var(--md-outline)",
                  background: "var(--md-surface-1)",
                  color: "var(--md-on-surface)",
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Pilih Semua Semester {activeSemester}
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--md-surface-2)", borderBottom: "1px solid var(--md-outline-variant)" }}>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 900, textAlign: "center", width: 50, color: "var(--md-on-surface-variant)" }}>No</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 900, textAlign: "center", width: 100, color: "var(--md-on-surface-variant)" }}>Kode</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 900, textAlign: "left", color: "var(--md-on-surface-variant)" }}>Nama Mata Kuliah</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 900, textAlign: "center", width: 64, color: "var(--md-on-surface-variant)" }}>SKS</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 900, textAlign: "center", width: 80, color: "var(--md-on-surface-variant)" }}>Klaim</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 900, textAlign: "center", width: 220, color: "var(--md-on-surface-variant)" }}>Jenis Pengajuan RPL</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMatkul.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)", fontSize: 13, fontWeight: 700 }}>
                        Tidak ada mata kuliah pada semester ini.
                      </td>
                    </tr>
                  ) : (
                    activeMatkul.map((mk, idx) => {
                      const isSelectable = mk.isRpl !== false;
                      const isSelected = Boolean(selections[mk.id]);

                      return (
                        <tr
                          key={mk.id}
                          style={{
                            borderBottom: "1px solid var(--md-outline-variant)",
                            background: !isSelectable
                              ? "var(--md-surface-2)"
                              : isSelected
                              ? "var(--md-primary-container)"
                              : "var(--md-surface-1)",
                            color: !isSelectable ? "var(--md-on-surface-variant)" : "var(--md-on-surface)",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "12px", textAlign: "center", fontSize: 12, fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: "12px", textAlign: "center", fontSize: 12, fontWeight: 800, fontFamily: "monospace" }}>{mk.kode}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 800 }}>
                            {mk.namaMatkul}
                            {!isSelectable && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  borderRadius: 999,
                                  padding: "2px 8px",
                                  background: "var(--md-surface-2)",
                                  color: "var(--md-on-surface-variant)",
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  border: "1px solid var(--md-outline-variant)",
                                  textTransform: "uppercase",
                                }}
                              >
                                Wajib Kuliah Reguler
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", fontWeight: 900, color: "var(--md-primary)" }}>{mk.sks}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            {isSelectable ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleToggleMatkul(mk.id, e.target.checked)}
                                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--md-primary)" }}
                                aria-label={`Pilih ${mk.namaMatkul}`}
                              />
                            ) : (
                              <span style={{ color: "var(--md-on-surface-variant)" }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {isSelectable ? (
                              <select
                                value={selections[mk.id] || "Perolehan"}
                                disabled={!isSelected}
                                onChange={(e) => handleJenisChange(mk.id, e.target.value)}
                                style={{
                                  width: "100%",
                                  minHeight: 34,
                                  borderRadius: 8,
                                  border: "1px solid var(--md-outline)",
                                  background: "var(--md-surface-1)",
                                  color: "var(--md-on-surface)",
                                  padding: "4px 8px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  outline: "none",
                                  opacity: isSelected ? 1 : 0.45,
                                  cursor: isSelected ? "pointer" : "not-allowed",
                                }}
                              >
                                <option value="Perolehan">Perolehan (Pengalaman Kerja)</option>
                                <option value="Transfer">Transfer (Pernah Kuliah/D3/S1)</option>
                              </select>
                            ) : (
                              <span style={{ color: "var(--md-on-surface-variant)" }}>-</span>
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

      {/* Save Message Toast */}
      {saveMessage && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 13,
            background: saveMessage.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
            color: saveMessage.type === "success" ? "var(--md-success)" : "var(--md-error)",
            border: `1.5px solid ${saveMessage.type === "success" ? "var(--md-success)" : "var(--md-error)"}`,
          }}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Sticky Bottom Summary & Submit Bar */}
      <div
        style={{
          position: "sticky",
          bottom: 14,
          zIndex: 20,
          padding: "14px 20px",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: 20,
          background: "var(--md-surface-1)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--md-on-surface)", fontWeight: 900 }}>
            Total Klaim Terpilih: <span style={{ color: "var(--md-primary)" }}>{totalSks} SKS</span> ({selectedItems.length} Mata Kuliah)
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--md-on-surface-variant)", fontWeight: 600 }}>
            Maksimal rekomendasi RPL Tipe A adalah 100 SKS. Klik simpan untuk merekam pengajuan ke sistem.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={{
            background: isSaving ? "var(--md-surface-2)" : "var(--md-primary)",
            color: isSaving ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
            border: "none",
            borderRadius: 999,
            padding: "12px 26px",
            fontSize: 13.5,
            fontWeight: 800,
            cursor: isSaving ? "not-allowed" : "pointer",
            boxShadow: isSaving ? "none" : "0 4px 14px var(--theme-glow)",
            transition: "all 0.18s ease",
          }}
        >
          {isSaving ? "Menyimpan Data..." : "Simpan Formulir F02 →"}
        </button>
      </div>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontSize: 10.5, fontWeight: 800, color: "var(--md-on-surface-variant)", textTransform: "uppercase" }}>
        {label}
      </label>
      <div
        style={{
          background: "var(--md-surface-2)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--md-on-surface)",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SummaryPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        border: highlight ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
        background: highlight ? "var(--md-primary-container)" : "var(--md-surface-1)",
        color: highlight ? "var(--md-primary)" : "var(--md-on-surface)",
        borderRadius: 999,
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", opacity: 0.8 }}>{label}:</span>
      <strong style={{ fontSize: 12, fontWeight: 900 }}>{value}</strong>
    </div>
  );
}
