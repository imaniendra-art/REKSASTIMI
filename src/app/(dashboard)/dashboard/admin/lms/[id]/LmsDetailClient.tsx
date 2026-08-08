"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { LearningMaterialEditor } from "./LearningMaterialEditor";
import { getYoutubeEmbedUrl, normalizeYoutubeUrl } from "@/lib/youtube";

type Matkul = { id: string; kode: string; namaMatkul: string; sks: number; semester: number };

type LearningMaterial = {
  _id?: string;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  courseId: string;
  courseName: string;
  order: number;
  isActive: boolean;
  pretestQuestions: {
    _id?: string;
    questionText: string;
    options: { label: string; text: string }[];
    correctAnswer: string;
    score: number;
    order: number;
    isActive: boolean;
  }[];
};

type Klaster = {
  id: string;
  namaKlaster: string;
  deskripsi: string;
  lmsDeskripsi: string;
  lmsVideos: string[];
  lmsDocuments: { title: string; url: string }[];
  learningMaterials: LearningMaterial[];
  matkuls: Matkul[];
};

type Option = { label: string; text: string; };

type AssessmentQuestion = {
  id: string;
  type: string;
  questionText: string;
  options: Option[];
  correctAnswer?: string;
  order: number;
  isActive: boolean;
  course: { id: string; kode: string; namaMatkul: string } | null;
};

const fieldStyle = {
  width: "100%",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "var(--md-on-surface)",
  boxSizing: "border-box",
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 11px",
        background: active ? "#d1fae5" : "#f1f5f9",
        color: active ? "#065f46" : "#475569",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {active ? "Aktif" : "Non-Aktif"}
    </span>
  );
}

export function LmsDetailClient({ moduleId }: { moduleId: string }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States for Klaster LMS Settings
  const [lmsDeskripsi, setLmsDeskripsi] = useState("");
  const [lmsVideos, setLmsVideos] = useState<string[]>([]);
  const [lmsDocuments, setLmsDocuments] = useState<{ title: string; url: string }[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);

  const [formData, setFormData] = useState({
    courseId: "",
    type: "MULTIPLE_CHOICE",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    isActive: true,
  });

  const { data: klasterData } = useQuery({
    queryKey: ["assessment_klaster", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/asesmen/${moduleId}`);
      if (!res.ok) throw new Error("Failed to fetch klaster");
      return res.json() as Promise<{ data: Klaster }>;
    },
  });

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["assessment_questions", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/asesmen/${moduleId}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json() as Promise<{ data: AssessmentQuestion[] }>;
    },
  });

  const klaster = klasterData?.data;
  const questions = questionsData?.data || [];

  useEffect(() => {
    if (klaster) {
      setLmsDeskripsi(klaster.lmsDeskripsi || "");
      setLmsVideos(klaster.lmsVideos?.length ? klaster.lmsVideos : [""]);
      setLmsDocuments(klaster.lmsDocuments?.length ? klaster.lmsDocuments : [{ title: "", url: "" }]);
      setLearningMaterials(klaster.learningMaterials || []);
    }
  }, [klaster]);

  const updateLmsMutation = useMutation({
    mutationFn: async () => {
      const cleanedVideos = lmsVideos.filter(v => v.trim() !== "");
      const cleanedDocs = lmsDocuments.filter(d => d.title.trim() !== "" || d.url.trim() !== "");

      // Validasi videoUrl
      for (const m of learningMaterials) {
        if (m.videoUrl && m.videoUrl.trim() !== "") {
          const normalized = normalizeYoutubeUrl(m.videoUrl);
          if (!normalized) {
            throw new Error(`Link video YouTube tidak valid pada materi "${m.title || 'Tanpa Judul'}". Tempel link YouTube dari tombol Share atau link watch YouTube.`);
          }
        }
      }
      
      const res = await fetch(`/api/admin/asesmen/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lmsDeskripsi,
          lmsVideos: [],
          lmsDocuments: [],
          learningMaterials: learningMaterials.map((m) => ({
            ...m,
            videoUrl: m.videoUrl && m.videoUrl.trim() !== "" ? normalizeYoutubeUrl(m.videoUrl) : "",
            courseId: m.courseId === "" ? null : m.courseId
          }))
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan LMS");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_klaster", moduleId] });
      setNotice({ type: "success", text: "Pengaturan LMS berhasil disimpan." });
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        course: data.courseId || undefined,
        questionText: data.questionText,
        type: data.type,
        options: data.type === "MULTIPLE_CHOICE" ? [
          { label: "A", text: data.optionA },
          { label: "B", text: data.optionB },
          { label: "C", text: data.optionC },
          { label: "D", text: data.optionD },
        ] : [],
        correctAnswer: data.type === "MULTIPLE_CHOICE" ? data.correctAnswer : undefined,
        isActive: data.isActive,
      };

      const res = await fetch(`/api/admin/asesmen/${moduleId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal menambah pertanyaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_questions", moduleId] });
      setNotice({ type: "success", text: "Pertanyaan berhasil ditambahkan." });
      closeModal();
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const payload: any = { ...data, course: data.courseId || undefined };
      if (data.type === "MULTIPLE_CHOICE") {
        payload.options = [
          { label: "A", text: data.optionA },
          { label: "B", text: data.optionB },
          { label: "C", text: data.optionC },
          { label: "D", text: data.optionD },
        ];
      }

      const res = await fetch(`/api/admin/asesmen/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal mengubah pertanyaan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_questions", moduleId] });
      setNotice({ type: "success", text: "Pertanyaan berhasil diperbarui." });
      closeModal();
    },
    onError: (err) => setNotice({ type: "error", text: err.message }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/asesmen/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status pertanyaan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment_questions", moduleId] });
    },
  });

  const openModal = (q?: AssessmentQuestion) => {
    setNotice(null);
    if (q) {
      setEditId(q.id);
      setFormData({
        courseId: q.course?.id || "",
        type: q.type || "MULTIPLE_CHOICE",
        questionText: q.questionText,
        optionA: q.options?.find((o) => o.label === "A")?.text || "",
        optionB: q.options?.find((o) => o.label === "B")?.text || "",
        optionC: q.options?.find((o) => o.label === "C")?.text || "",
        optionD: q.options?.find((o) => o.label === "D")?.text || "",
        correctAnswer: q.correctAnswer || "A",
        isActive: q.isActive,
      });
    } else {
      setEditId(null);
      setFormData({
        courseId: klaster?.matkuls?.[0]?.id || "",
        type: "MULTIPLE_CHOICE",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateQuestionMutation.mutate({ id: editId, data: formData });
    else createQuestionMutation.mutate(formData);
  };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Edit Klaster Modul"
        title={klaster?.namaKlaster || "Memuat..."}
        subtitle={`${klaster?.learningMaterials?.filter((m: any) => m.isActive && m.videoUrl && m.videoUrl.trim() !== "").length || 0} Video Pembelajaran \u2022 ${klaster?.learningMaterials?.reduce((sum: number, m: any) => sum + (m.isActive ? (m.pretestQuestions?.length || 0) : 0), 0)} Soal Pretest \u2022 ${questions.filter((q: any) => q.type === "MULTIPLE_CHOICE").length} Soal Ujian Akhir`}
        rightContent={null}
      />

      {notice && (
        <div
          className="md-card"
          style={{ padding: "14px 16px", marginBottom: 18, borderColor: notice.type === "success" ? "#86efac" : "#fecaca", background: notice.type === "success" ? "#f0fdf4" : "#fef2f2", color: notice.type === "success" ? "#166534" : "#991b1b", fontWeight: 800 }}
        >
          {notice.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))", gap: 24, alignItems: "start", paddingBottom: 40 }}>
        {/* Bagian LMS Settings */}
        <div className="md-card" style={{ padding: "20px 24px", minWidth: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)", marginBottom: 16 }}>Materi Pembelajaran (LMS)</h2>
        
        <div style={{ display: "grid", gap: 20 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
            Deskripsi Pengantar Klaster Modul
            <textarea
              value={lmsDeskripsi}
              onChange={(e) => setLmsDeskripsi(e.target.value)}
              style={{ ...fieldStyle, minHeight: 100 }}
              placeholder="Deskripsi singkat yang akan dibaca mahasiswa sebelum asesmen..."
            />
          </label>



          <LearningMaterialEditor 
            materials={learningMaterials}
            onChange={setLearningMaterials}
            matkuls={klaster?.matkuls || []}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => updateLmsMutation.mutate()}
            disabled={updateLmsMutation.isPending}
            style={{ ...primaryButtonStyle, opacity: updateLmsMutation.isPending ? 0.6 : 1 }}
          >
            {updateLmsMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan LMS"}
          </button>
        </div>
      </div>

      {/* Bagian Soal Asesmen */}
      <div className="md-card" style={{ overflow: "hidden", minWidth: 0 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--md-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>Bank Soal Asesmen</h2>
            <p style={{ marginTop: 4, fontSize: 12, color: "var(--md-on-surface-variant)", fontWeight: 700 }}>
              Daftar pertanyaan yang terkait dengan mata kuliah pada klaster ini.
            </p>
          </div>
          <button onClick={() => openModal()} type="button" style={{ ...primaryButtonStyle, padding: "8px 16px", fontSize: 13 }}>
            + Tambah Soal
          </button>
        </div>

        <div style={{ background: "#f8fafc", padding: "14px", display: "grid", gap: 14 }}>
          {isLoading ? (
            <div style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>Memuat data...</div>
          ) : questions.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center", color: "var(--md-on-surface-variant)" }}>Belum ada soal asesmen di klaster ini.</div>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, display: "flex", gap: 16, boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {q.course ? `${q.course.kode} - ${q.course.namaMatkul}` : "Umum (Tidak terikat matkul)"} {"\u2022"} {q.type === "MULTIPLE_CHOICE" ? "PILIHAN GANDA" : "ESSAI"}
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--md-on-surface)" }}>{q.questionText}</h4>
                      <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                        <StatusBadge active={q.isActive} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleActiveMutation.mutate({ id: q.id, isActive: !q.isActive })} style={{ ...ghostButtonStyle, padding: "6px 10px", fontSize: 11 }}>
                        {q.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button onClick={() => openModal(q)} style={{ ...ghostButtonStyle, padding: "6px 10px", fontSize: 11 }}>
                        Edit
                      </button>
                    </div>
                  </div>

                  {q.type === "MULTIPLE_CHOICE" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {q.options.map((opt) => (
                        <div key={opt.label} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${q.correctAnswer === opt.label ? "#86efac" : "#e2e8f0"}`, background: q.correctAnswer === opt.label ? "#f0fdf4" : "#f8fafc", fontSize: 13, display: "flex", gap: 8 }}>
                          <strong style={{ color: q.correctAnswer === opt.label ? "#166534" : "#475569" }}>{opt.label}.</strong>
                          <span style={{ color: q.correctAnswer === opt.label ? "#166534" : "var(--md-on-surface)" }}>{opt.text}</span>
                          {q.correctAnswer === opt.label && (
                            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>Benar</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.52)", padding: 16 }}>
          <div className="md-card" style={{ width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", background: "#fff" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--md-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <div><h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>{editId ? "Edit Soal" : "Tambah Soal"}</h3></div>
              <button onClick={closeModal} style={{ minWidth: 72, height: 36, borderRadius: 999, border: "1px solid var(--md-outline-variant)", background: "#fff", color: "var(--md-on-surface-variant)", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>Tutup</button>
            </div>

            <form onSubmit={handleSubmitQuestion} style={{ padding: 22 }}>
              <div style={{ display: "grid", gap: 16 }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>
                    Mata Kuliah Terkait
                    <select required value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} style={fieldStyle}>
                      <option value="" disabled>Pilih Mata Kuliah...</option>
                      {klaster?.matkuls?.map((mk) => (
                        <option key={mk.id} value={mk.id}>{mk.kode} - {mk.namaMatkul}</option>
                      ))}
                    </select>
                  </label>
                  
                  <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>
                    Model Evaluasi
                    <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={fieldStyle}>
                      <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                      <option value="ESSAY">Essai</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>
                  Pertanyaan *
                  <textarea required value={formData.questionText} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })} style={{ ...fieldStyle, minHeight: 80 }} placeholder="Masukkan isi pertanyaan di sini..." />
                </label>

                {formData.type === "MULTIPLE_CHOICE" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>Opsi A * <input type="text" required value={formData.optionA} onChange={(e) => setFormData({ ...formData, optionA: e.target.value })} style={fieldStyle} /></label>
                      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>Opsi B * <input type="text" required value={formData.optionB} onChange={(e) => setFormData({ ...formData, optionB: e.target.value })} style={fieldStyle} /></label>
                      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>Opsi C * <input type="text" required value={formData.optionC} onChange={(e) => setFormData({ ...formData, optionC: e.target.value })} style={fieldStyle} /></label>
                      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)", minWidth: 0 }}>Opsi D * <input type="text" required value={formData.optionD} onChange={(e) => setFormData({ ...formData, optionD: e.target.value })} style={fieldStyle} /></label>
                    </div>

                      <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 900, color: "var(--md-on-surface)" }}>Jawaban Benar *
                        <select value={formData.correctAnswer} onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })} style={fieldStyle}>
                          <option value="A">Opsi A</option><option value="B">Opsi B</option><option value="C">Opsi C</option><option value="D">Opsi D</option>
                        </select>
                      </label>
                  </>
                )}

                {formData.type === "ESSAY" && null}
              </div>

              <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closeModal} style={ghostButtonStyle}>Batal</button>
                <button type="submit" disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending} style={{ ...primaryButtonStyle, opacity: createQuestionMutation.isPending || updateQuestionMutation.isPending ? 0.65 : 1 }}>
                  {createQuestionMutation.isPending || updateQuestionMutation.isPending ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
