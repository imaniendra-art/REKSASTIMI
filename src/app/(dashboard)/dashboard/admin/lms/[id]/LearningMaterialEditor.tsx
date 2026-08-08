"use client";

import React, { useState } from "react";

const fieldStyle = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "var(--md-on-surface)",
  boxSizing: "border-box",
} as const;

const ghostButtonStyle = {
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 12,
  padding: "9px 13px",
  background: "#fff",
  color: "var(--md-on-surface)",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease",
} as const;

const primaryButtonStyle = {
  border: 0,
  borderRadius: 14,
  padding: "12px 18px",
  background: "var(--md-primary)",
  color: "#fff",
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(26,86,219,0.18)",
  transition: "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease, background 160ms ease",
} as const;

const responsiveFieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 14,
  minWidth: 0,
} as const;

const compactTextStyle = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

export function LearningMaterialEditor({
  materials,
  onChange,
  matkuls
}: {
  materials: any[];
  onChange: (newMaterials: any[]) => void;
  matkuls: { id: string; kode: string; namaMatkul: string }[];
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mIndex: number;
    pIndex: number; // -1 if new
    data: any;
  }>({ isOpen: false, mIndex: -1, pIndex: -1, data: null });

  const handleAddMaterial = () => {
    const newMaterial = {
      title: "",
      description: "",
      videoUrl: "",
      pdfUrl: "",
      courseId: "",
      courseName: "",
      order: materials.length + 1,
      isActive: true,
      pretestQuestions: []
    };
    onChange([...materials, newMaterial]);
    setExpandedIndex(materials.length);
  };

  const handleUpdateMaterial = (index: number, key: string, value: any) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [key]: value };
    if (key === "courseId") {
      const found = matkuls.find((m) => m.id === value);
      if (found) {
        newMaterials[index].courseName = found.namaMatkul;
      } else {
        newMaterials[index].courseName = "";
      }
    }
    onChange(newMaterials);
  };

  const handleRemoveMaterial = (index: number) => {
    if (confirm("Hapus materi ini beserta soal pretestnya?")) {
      const newMaterials = materials.filter((_, i) => i !== index);
      onChange(newMaterials);
    }
  };

  const openPretestModal = (mIndex: number, pIndex: number = -1) => {
    let data;
    if (pIndex === -1) {
      data = {
        questionText: "",
        options: [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" }
        ],
        correctAnswer: "A",
        score: 10,
        isActive: true
      };
    } else {
      data = JSON.parse(JSON.stringify(materials[mIndex].pretestQuestions[pIndex]));
    }
    setModal({ isOpen: true, mIndex, pIndex, data });
  };

  const closePretestModal = () => setModal({ isOpen: false, mIndex: -1, pIndex: -1, data: null });

  const savePretestModal = () => {
    const newMaterials = [...materials];
    const { mIndex, pIndex, data } = modal;
    
    if (pIndex === -1) {
      data.order = newMaterials[mIndex].pretestQuestions.length + 1;
      newMaterials[mIndex].pretestQuestions.push(data);
    } else {
      newMaterials[mIndex].pretestQuestions[pIndex] = data;
    }
    onChange(newMaterials);
    closePretestModal();
  };

  const updateModalData = (key: string, value: any) => {
    if (key.startsWith("opt-")) {
      const optLabel = key.split("-")[1];
      const newOptions = modal.data.options.map((opt: any) =>
        opt.label === optLabel ? { ...opt, text: value } : opt
      );
      setModal({ ...modal, data: { ...modal.data, options: newOptions } });
    } else {
      setModal({ ...modal, data: { ...modal.data, [key]: value } });
    }
  };

  const handleRemovePretest = (mIndex: number, pIndex: number) => {
    if (confirm("Hapus soal ini?")) {
      const newMaterials = [...materials];
      newMaterials[mIndex].pretestQuestions = newMaterials[mIndex].pretestQuestions.filter((_: any, i: number) => i !== pIndex);
      onChange(newMaterials);
    }
  };

  return (
    <div style={{ marginTop: 24, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>Alur Materi & Pretest</h3>
        <button type="button" onClick={handleAddMaterial} style={{ ...ghostButtonStyle, padding: "6px 12px", fontSize: 12, background: "var(--md-primary)", color: "#fff", borderColor: "var(--md-primary)" }}>
          + Tambah Materi
        </button>
      </div>

      {materials.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "1px dashed #cbd5e1", color: "var(--md-on-surface-variant)" }}>
          Belum ada materi pembelajaran terstruktur.
        </div>
      )}

      <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
        {materials.map((m, mIdx) => (
          <div key={mIdx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", minWidth: 0 }}>
            <div
              style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, cursor: "pointer", background: expandedIndex === mIdx ? "#eff6ff" : "transparent", minWidth: 0 }}
              onClick={() => setExpandedIndex(expandedIndex === mIdx ? null : mIdx)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--md-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>
                  {mIdx + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ ...compactTextStyle, display: "block", fontSize: 14, color: "var(--md-on-surface)" }}>{m.title || "Materi Tanpa Judul"}</strong>
                  <div style={{ ...compactTextStyle, fontSize: 11, color: "var(--md-on-surface-variant)", marginTop: 2 }}>{m.pretestQuestions?.length || 0} Soal Pretest {"\u2022"} {m.courseName || "Tanpa Matkul"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveMaterial(mIdx); }} style={{ ...ghostButtonStyle, padding: "4px 8px", fontSize: 11, color: "#ef4444" }}>Hapus</button>
              </div>
            </div>

            {expandedIndex === mIdx && (
              <div style={{ padding: 20, borderTop: "1px solid #e2e8f0", display: "grid", gap: 16, minWidth: 0 }}>
                <div style={responsiveFieldGridStyle}>
                  <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, minWidth: 0 }}>Judul Materi *
                    <input type="text" value={m.title} onChange={(e) => handleUpdateMaterial(mIdx, "title", e.target.value)} style={fieldStyle} />
                  </label>
                  <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, minWidth: 0 }}>Terkait Mata Kuliah
                    <select value={m.courseId || ""} onChange={(e) => handleUpdateMaterial(mIdx, "courseId", e.target.value)} style={fieldStyle}>
                      <option value="">-- Tidak Spesifik --</option>
                      {matkuls.map((mk) => <option key={mk.id} value={mk.id}>{mk.kode} - {mk.namaMatkul}</option>)}
                    </select>
                  </label>
                </div>
                
                <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, marginTop: 14, minWidth: 0 }}>Link Video YouTube
                  <input type="text" value={m.videoUrl} onChange={(e) => handleUpdateMaterial(mIdx, "videoUrl", e.target.value)} style={fieldStyle} placeholder="https://youtu.be/VIDEO_ID atau https://www.youtube.com/watch?v=VIDEO_ID" />
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--md-on-surface-variant)" }}>Tempel link YouTube biasa. Sistem akan otomatis mengubahnya menjadi format embed untuk ditampilkan di halaman mahasiswa.</span>
                </label>
                <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, marginTop: 14, minWidth: 0 }}>Dokumen Pembelajaran (Tautan URL PDF)
                  <input type="text" value={m.pdfUrl || ""} onChange={(e) => handleUpdateMaterial(mIdx, "pdfUrl", e.target.value)} style={fieldStyle} placeholder="https://drive.google.com/... (Google Drive, dll)" />
                </label>

                <div style={{ marginTop: 16, borderTop: "1px dashed #cbd5e1", paddingTop: 16, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, minWidth: 0 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--md-on-surface)" }}>Soal Pretest (Latihan)</h4>
                    <button type="button" onClick={() => openPretestModal(mIdx)} style={{ ...ghostButtonStyle, padding: "4px 10px", fontSize: 11 }}>+ Tambah Soal Pretest</button>
                  </div>

                  {m.pretestQuestions.length === 0 ? (
                    <div style={{ padding: 16, textAlign: "center", color: "#64748b", fontSize: 13, border: "1px dashed #cbd5e1", borderRadius: 12 }}>Belum ada soal pretest</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                      {m.pretestQuestions.map((q: any, pIdx: number) => (
                        <div key={pIdx} style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {pIdx + 1}. {q.questionText || "Soal Kosong"}
                            </div>
                            <div style={{ ...compactTextStyle, fontSize: 11, color: "#16a34a", marginTop: 4, fontWeight: 800 }}>
                              Jawaban: {q.correctAnswer} - {q.options.find((o: any) => o.label === q.correctAnswer)?.text || "?"}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button type="button" onClick={() => openPretestModal(mIdx, pIdx)} style={{ ...ghostButtonStyle, padding: "4px 10px", fontSize: 11 }}>Edit</button>
                            <button type="button" onClick={() => handleRemovePretest(mIdx, pIdx)} style={{ ...ghostButtonStyle, padding: "4px 10px", fontSize: 11, color: "#ef4444" }}>Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modal.isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", padding: 16 }}>
          <div className="md-card" style={{ width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", background: "#fff" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--md-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>{modal.pIndex === -1 ? "Tambah Soal Pretest" : "Edit Soal Pretest"}</h3>
              <button type="button" onClick={closePretestModal} style={{ minWidth: 72, height: 36, borderRadius: 999, border: "1px solid var(--md-outline-variant)", background: "#fff", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>Tutup</button>
            </div>
            
            <div style={{ padding: 22, display: "grid", gap: 16, minWidth: 0 }}>
              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, minWidth: 0 }}>
                Pertanyaan *
                <textarea value={modal.data.questionText} onChange={(e) => updateModalData("questionText", e.target.value)} style={{ ...fieldStyle, minHeight: 80 }} placeholder="Isi soal..." />
              </label>

              <div style={responsiveFieldGridStyle}>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, minWidth: 0 }}>Opsi A <input type="text" value={modal.data.options.find((o: any) => o.label === "A")?.text || ""} onChange={(e) => updateModalData("opt-A", e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, minWidth: 0 }}>Opsi B <input type="text" value={modal.data.options.find((o: any) => o.label === "B")?.text || ""} onChange={(e) => updateModalData("opt-B", e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, minWidth: 0 }}>Opsi C <input type="text" value={modal.data.options.find((o: any) => o.label === "C")?.text || ""} onChange={(e) => updateModalData("opt-C", e.target.value)} style={fieldStyle} /></label>
                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, minWidth: 0 }}>Opsi D <input type="text" value={modal.data.options.find((o: any) => o.label === "D")?.text || ""} onChange={(e) => updateModalData("opt-D", e.target.value)} style={fieldStyle} /></label>
              </div>

              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900 }}>
                Kunci Jawaban:
                <select value={modal.data.correctAnswer} onChange={(e) => updateModalData("correctAnswer", e.target.value)} style={{ ...fieldStyle, width: "auto" }}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </label>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closePretestModal} style={ghostButtonStyle}>Batal</button>
                <button type="button" onClick={savePretestModal} style={primaryButtonStyle}>Simpan Soal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
