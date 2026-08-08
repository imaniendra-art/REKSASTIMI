"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  courseId: string;
  type?: string;
  questionText: string;
  options: { label: string; text: string }[];
};

type Matkul = {
  id: string;
  kode: string;
  namaMatkul: string;
};

type TesData = {
  klaster: { id: string; namaKlaster: string; lmsDeskripsi: string };
  matkuls: Matkul[];
  questions: Question[];
};

export function TesClient({ klasterId }: { klasterId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: tesDataWrapper, isLoading, error } = useQuery({
    queryKey: ["mahasiswa_tes", klasterId],
    queryFn: async () => {
      const res = await fetch(`/api/mahasiswa/asesmen/${klasterId}`);
      if (res.status === 403) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "access_denied");
      }
      if (!res.ok) throw new Error("Failed to fetch tes data");
      return res.json() as Promise<{ data: TesData }>;
    },
    retry: false
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { questionId: string; selectedOption: string }[]) => {
      const res = await fetch(`/api/mahasiswa/asesmen/${klasterId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan jawaban");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa_asesmen"] });
      alert("Asesmen berhasil diselesaikan!");
      router.push(`/dashboard/mahasiswa/asesmen/${klasterId}/hasil`);
    },
    onError: () => {
      alert("Gagal mengirim jawaban. Silakan coba lagi.");
    }
  });

  const tesData = tesDataWrapper?.data;
  const activeQuestion = tesData?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressValue = tesData?.questions.length ? Math.round((answeredCount / tesData.questions.length) * 100) : 0;

  const handleSelect = (questionId: string, optionLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLabel
    }));
  };

  const handleSubmit = () => {
    if (!tesData) return;

    const unanswered = tesData.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`Terdapat ${unanswered.length} soal yang belum dijawab. Apakah Anda yakin ingin mengumpulkan?`)) {
        return;
      }
    } else if (!confirm("Apakah Anda yakin ingin mengumpulkan semua jawaban? Jawaban yang sudah dikumpulkan tidak dapat diubah.")) {
      return;
    }

    const payload = tesData.questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] || ""
    }));

    submitMutation.mutate(payload);
  };

  /* ── Error state ── */
  if (error) {
    const message = (error as Error).message;
    const isCompleted = message.includes("sudah menyelesaikan");
    return (
      <div style={{ width: "100%" }}>
        <PageHero tone="maroon" badgeText="Test Kompetensi" title={isCompleted ? "Tes Sudah Selesai" : "Tes Belum Dapat Dibuka"} subtitle="" rightContent={null} />
        <div style={{ padding: 40, textAlign: "center", background: "var(--md-surface-1)", borderRadius: "var(--md-radius-lg)", border: "1px solid var(--md-outline-variant)", marginTop: 24 }}>
          <span style={{ fontSize: 40 }}>{isCompleted ? "✅" : "⚠️"}</span>
          <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>
            {isCompleted ? "Anda sudah menyelesaikan tes ini" : message}
          </h3>
          <Link href={`/dashboard/mahasiswa/asesmen/${klasterId}`} className="md-btn" style={{ marginTop: 16, display: "inline-flex" }}>
            Kembali ke Materi Pembelajaran
          </Link>
        </div>
      </div>
    );
  }

  /* ── Loading state ── */
  if (isLoading || !tesData) {
    return (
      <div style={{ width: "100%" }}>
        <PageHero tone="maroon" badgeText="Lembar Ujian" title="Menyiapkan Soal..." subtitle="" rightContent={null} />
        <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
          Menyiapkan soal ujian...
        </div>
      </div>
    );
  }

  /* ── No questions ── */
  if (!activeQuestion) {
    return (
      <div style={{ width: "100%" }}>
        <PageHero tone="maroon" badgeText="Lembar Ujian" title="Soal Belum Tersedia" subtitle="" rightContent={null} />
        <div className="md-card" style={{ padding: "40px 24px", textAlign: "center", marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>Belum ada soal aktif</h3>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--md-on-surface-variant)" }}>Belum ada soal yang dapat ditampilkan untuk klaster ini.</p>
          <button onClick={() => router.push(`/dashboard/mahasiswa/asesmen/${klasterId}`)} className="md-btn-outlined" style={{ marginTop: 16, padding: "10px 20px", borderRadius: "var(--md-radius-full)", cursor: "pointer", fontSize: 13, fontWeight: 700, border: "1.5px solid var(--md-outline)" }}>
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  const matkul = tesData.matkuls.find(m => m.id === activeQuestion.courseId);
  const isAnswered = !!answers[activeQuestion.id];
  const totalQ = tesData.questions.length;
  const belum = totalQ - answeredCount;

  return (
    <div style={{ width: "100%" }}>

      {/* ── Hero Header ── */}
      <PageHero
        tone="maroon"
        badgeText="Lembar Ujian Kompetensi"
        title={tesData.klaster.namaKlaster}
        subtitle={`Progress pengisian: ${answeredCount} dari ${totalQ} soal terjawab (${progressValue}%)`}
        rightContent={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {[
              { label: "Total", value: totalQ, color: "#fff" },
              { label: "Dijawab", value: answeredCount, color: "#86efac" },
              { label: "Belum", value: belum, color: "#fca5a5" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "8px 16px", minWidth: 72 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, opacity: 0.8, marginBottom: 4, color: "#fff" }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        }
      />

      {/* ── Progress Bar ── */}
      <div style={{ marginBottom: 28, background: "var(--md-surface-1)", borderRadius: "var(--md-radius-lg)", border: "1px solid var(--md-outline-variant)", padding: "14px 20px", boxShadow: "var(--md-shadow-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
          <span>Progress Pengisian</span>
          <span style={{ color: "var(--md-primary)" }}>{progressValue}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: "var(--md-outline-variant)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--md-primary), var(--md-secondary))", width: `${progressValue}%`, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* ── Grid Utama ── */}
      <div className="exam-grid-layout" style={{ display: "grid", gap: 28, alignItems: "start" }}>
      {/* responsive columns defined via CSS class exam-grid-layout below */}
      <style>{`
        .exam-grid-layout { grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .exam-grid-layout { grid-template-columns: minmax(0, 1fr) 340px; } }
      `}</style>

        {/* ── Card Soal Aktif ── */}
        <div className="md-card" style={{ overflow: "hidden" }}>

          {/* Header Soal */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)", display: "flex", flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: 10 }}>
              <span className="md-chip" style={{ fontWeight: 800, fontSize: 13 }}>
                Soal {currentQuestionIndex + 1} dari {totalQ}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                background: isAnswered ? "var(--md-success-container)" : "var(--md-error-container)",
                color: isAnswered ? "var(--md-success)" : "var(--md-error)",
                border: `1px solid ${isAnswered ? "#6ee7b7" : "#fca5a5"}`,
              }}>
                {isAnswered ? "✓ Terjawab" : "Belum Dijawab"}
              </span>
            </div>
            {matkul && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--md-on-surface-variant)" }}>
                Mata Kuliah: <strong style={{ color: "var(--md-on-surface)", fontWeight: 800 }}>{matkul.namaMatkul}</strong>
              </span>
            )}
          </div>

          {/* Body: Pertanyaan + Opsi */}
          <div style={{ padding: "28px 24px 32px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.7, color: "var(--md-on-surface)", marginBottom: 28, maxWidth: 800 }}>
              {activeQuestion.questionText}
            </p>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              {activeQuestion.type === "ESSAY" ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--md-on-surface-variant)", marginBottom: 8 }}>
                    Tuliskan pendapat/jawaban Anda:
                  </label>
                  <textarea
                    value={answers[activeQuestion.id] || ""}
                    onChange={(e) => handleSelect(activeQuestion.id, e.target.value)}
                    placeholder="Ketik jawaban Anda di sini..."
                    style={{
                      width: "100%",
                      minHeight: "180px",
                      padding: "16px",
                      borderRadius: "var(--md-radius-lg)",
                      border: "1.5px solid var(--md-outline-variant)",
                      background: "var(--md-surface-1)",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "var(--md-on-surface)",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color 180ms",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--md-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--md-outline-variant)")}
                  />
                </div>
              ) : (
                activeQuestion.options.map((opt, optIdx) => {
                  const letter = opt.label;
                  const isSelected = answers[activeQuestion.id] === letter;
                  return (
                    <label
                      key={optIdx}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "16px 20px", minHeight: 64,
                        borderRadius: "var(--md-radius-lg)",
                        border: isSelected ? "2px solid var(--md-primary)" : "1.5px solid var(--md-outline-variant)",
                        background: isSelected ? "var(--md-primary-container)" : "var(--md-surface-1)",
                        boxShadow: isSelected ? "0 0 0 3px rgba(26,86,219,0.12)" : "none",
                        cursor: "pointer",
                        transition: "border-color 180ms, background 180ms, box-shadow 180ms",
                      }}
                      onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--md-surface-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--md-outline)"; }}}
                      onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--md-surface-1)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--md-outline-variant)"; }}}
                    >
                      <input
                        type="radio"
                        name={`question-${activeQuestion.id}`}
                        checked={isSelected}
                        onChange={() => handleSelect(activeQuestion.id, letter)}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 1,
                        background: isSelected ? "var(--md-primary)" : "var(--md-surface-2)",
                        color: isSelected ? "#fff" : "var(--md-on-surface-variant)",
                        border: isSelected ? "none" : "1.5px solid var(--md-outline)",
                        transition: "background 180ms, color 180ms",
                      }}>
                        {letter}
                      </span>
                      <span style={{
                        flex: 1, paddingTop: 7, fontSize: 15, lineHeight: 1.65,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                      }}>
                        {opt.text}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer: Navigasi */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="md-btn-outlined"
              style={{
                padding: "10px 18px", borderRadius: "var(--md-radius-full)", fontSize: 13, fontWeight: 700, cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                opacity: currentQuestionIndex === 0 ? 0.4 : 1,
                border: "1.5px solid var(--md-outline)",
                background: "transparent", color: "var(--md-primary)",
              }}
            >
              ← Sebelumnya
            </button>

            {currentQuestionIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="md-btn"
                style={{ padding: "10px 24px", borderRadius: "var(--md-radius-full)", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
              >
                Berikutnya →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="md-btn"
                style={{
                  padding: "10px 24px", borderRadius: "var(--md-radius-full)", fontSize: 13, fontWeight: 800, cursor: submitMutation.isPending ? "not-allowed" : "pointer",
                  background: submitMutation.isPending ? "var(--md-outline)" : "var(--md-success)",
                }}
              >
                {submitMutation.isPending ? "Mengirim..." : "Selesai & Kumpulkan Jawaban"}
              </button>
            )}
          </div>
        </div>

        {/* ── Sidebar Kanan ── */}
        <div className="exam-sidebar" style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        <style>{`
          @media (min-width: 1024px) { .exam-sidebar { position: sticky; top: 96px; } }
        `}</style>
          <div className="md-card" style={{ padding: 20 }}>

            {/* Ringkasan */}
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 14 }}>Ringkasan Ujian</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Total", value: totalQ, bg: "var(--md-surface-2)", color: "var(--md-on-surface)" },
                { label: "Dijawab", value: answeredCount, bg: "var(--md-success-container)", color: "var(--md-success)" },
                { label: "Belum", value: belum, bg: "var(--md-error-container)", color: "var(--md-error)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "10px 6px", borderRadius: "var(--md-radius-md)", background: s.bg }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: s.color, opacity: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Navigasi Soal */}
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)", marginBottom: 10 }}>Navigasi Soal</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 18 }}>
              {tesData.questions.map((q, idx) => {
                const qAnswered = !!answers[q.id];
                const isActive = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    style={{
                      height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "var(--md-radius-sm)", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      border: isActive ? "2px solid var(--md-primary)" : `1px solid ${qAnswered ? "#6ee7b7" : "var(--md-outline-variant)"}`,
                      background: isActive ? "var(--md-primary)" : qAnswered ? "var(--md-success-container)" : "var(--md-surface-1)",
                      color: isActive ? "#fff" : qAnswered ? "var(--md-success)" : "var(--md-on-surface-variant)",
                      boxShadow: isActive ? "0 0 0 3px rgba(26,86,219,0.2)" : "none",
                      transition: "all 180ms",
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Tombol Submit */}
            <p style={{ fontSize: 11, lineHeight: 1.5, color: "var(--md-on-surface-variant)", marginBottom: 12 }}>
              Pastikan semua soal telah terjawab sebelum mengumpulkan ujian.
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="md-btn"
              style={{
                width: "100%", height: 44, borderRadius: "var(--md-radius-full)", fontSize: 13, fontWeight: 800, cursor: submitMutation.isPending ? "not-allowed" : "pointer",
                background: submitMutation.isPending ? "var(--md-outline)" : "var(--md-primary)",
              }}
            >
              {submitMutation.isPending ? "Mengirim..." : "Kumpulkan Jawaban"}
            </button>
          </div>

          {/* Tombol Kembali */}
          <button
            onClick={() => router.push(`/dashboard/mahasiswa/asesmen/${klasterId}`)}
            className="md-btn-outlined"
            style={{
              width: "100%", height: 42, borderRadius: "var(--md-radius-full)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: "1.5px solid var(--md-outline)", background: "var(--md-surface-1)", color: "var(--md-primary)",
            }}
          >
            Tunda & Kembali ke Materi
          </button>
        </div>
      </div>
    </div>
  );
}
