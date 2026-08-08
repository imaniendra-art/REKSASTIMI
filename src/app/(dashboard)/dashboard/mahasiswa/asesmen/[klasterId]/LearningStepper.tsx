"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type PretestQuestion = {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
};

type Material = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  courseName?: string;
  pretestQuestions: PretestQuestion[];
};

type Progress = {
  materialId: string;
  isWatched: boolean;
  isCompleted: boolean;
  pretestScore?: number;
  pretestAnswers?: any[];
};

export function LearningStepper({
  materials,
  progress,
  klasterId,
  onFinishAll,
  isGlobalCompleted
}: {
  materials: Material[];
  progress: Progress[];
  klasterId: string;
  onFinishAll: () => void;
  isGlobalCompleted?: boolean;
}) {
  const queryClient = useQueryClient();
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(
    materials.find(m => !progress.find(p => p.materialId === m.id)?.isCompleted)?.id || materials[0]?.id || null
  );

  const activeMaterial = materials.find(m => m.id === activeMaterialId);
  const activeProgress = progress.find(p => p.materialId === activeMaterialId);
  const isWatched = activeProgress?.isWatched || false;
  const isCompleted = activeProgress?.isCompleted || false;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPretest, setShowPretest] = useState(isWatched && !isCompleted);
  // Show success message if completed
  const [showSuccessMessage, setShowSuccessMessage] = useState(isCompleted);
  const [isRetaking, setIsRetaking] = useState(false);

  const markWatchedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/mahasiswa/asesmen/${klasterId}/pretest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: activeMaterialId, isWatched: true })
      });
      if (!res.ok) throw new Error("Gagal menyimpan progres");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa_tes", klasterId] });
      setShowPretest(true);
    },
    onError: (err) => {
      console.error(err);
      alert("Error: " + (err as Error).message);
    }
  });

  const submitPretestMutation = useMutation({
    mutationFn: async () => {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt
      }));
      const res = await fetch(`/api/mahasiswa/asesmen/${klasterId}/pretest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: activeMaterialId, isWatched: true, answers: formattedAnswers })
      });
      if (!res.ok) throw new Error("Gagal mengirim pretest");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa_tes", klasterId] });
      setShowPretest(false);
      setShowSuccessMessage(true);
      setIsRetaking(false);
    },
    onError: (err) => {
      console.error(err);
      alert("Error: " + (err as Error).message);
    }
  });

  const handleNextMaterial = () => {
    setShowSuccessMessage(false);
    setIsRetaking(false);
    setAnswers({});
    const currentIndex = materials.findIndex(m => m.id === activeMaterialId);
    if (currentIndex < materials.length - 1) {
      const nextId = materials[currentIndex + 1].id;
      setActiveMaterialId(nextId);
      const nextProg = progress.find(p => p.materialId === nextId);
      setShowPretest(nextProg?.isWatched && !nextProg?.isCompleted ? true : false);
      setShowSuccessMessage(nextProg?.isCompleted ? true : false);
    } else {
      onFinishAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusColor = (m: Material) => {
    const prog = progress.find(p => p.materialId === m.id);
    if (prog?.isCompleted) return "#10b981"; // green
    if (m.id === activeMaterialId) return "var(--md-primary)"; // blue
    return "#cbd5e1"; // gray
  };

  if (!activeMaterialId) return null;

  return (
    <div style={{ marginTop: 32 }}>
      {/* Stepper Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
        {materials.map((m, idx) => {
          const isClickable = progress.find(p => p.materialId === m.id)?.isWatched || 
                              progress.find(p => p.materialId === m.id)?.isCompleted || 
                              idx === 0 || 
                              progress.find(p => p.materialId === materials[idx - 1].id)?.isCompleted;
          return (
          <div 
            key={m.id} 
            onClick={() => {
              if (isClickable) {
                setActiveMaterialId(m.id);
                const nextProg = progress.find(p => p.materialId === m.id);
                setShowPretest(nextProg?.isWatched && !nextProg?.isCompleted ? true : false);
                setShowSuccessMessage(nextProg?.isCompleted ? true : false);
                setIsRetaking(false);
                setAnswers({});
              }
            }}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, 
              opacity: getStatusColor(m) === "#cbd5e1" ? 0.5 : 1,
              cursor: isClickable ? "pointer" : "not-allowed"
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: getStatusColor(m), color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900
            }}>
              {progress.find(p => p.materialId === m.id)?.isCompleted ? "✓" : (idx + 1)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: getStatusColor(m) !== "#cbd5e1" ? "var(--md-on-surface)" : "#64748b", whiteSpace: "nowrap" }}>
              {m.title}
            </span>
            {idx < materials.length - 1 && <div style={{ width: 20, height: 2, background: "#e2e8f0" }} />}
          </div>
        )})}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-6 items-start">

        {/* Kolom Kiri: Video & Deskripsi */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
          {activeMaterial?.videoUrl ? (
            <iframe
              src={getYoutubeEmbedUrl(activeMaterial.videoUrl)}
              title={activeMaterial.title || "Video Pembelajaran"}
              className="w-full aspect-video border-b"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ display: "block", background: "#000", width: "100%", aspectRatio: "16/9", border: "none" }}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-slate-300 text-slate-600" style={{ width: "100%", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", background: "#cbd5e1", color: "#475569" }}>
              Video pembelajaran belum tersedia.
            </div>
          )}
          <div style={{ padding: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{activeMaterial?.title}</h3>
            <p style={{ color: "var(--md-on-surface-variant)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {activeMaterial?.description || "Tidak ada deskripsi."}
            </p>
          </div>

          {/* A. Modul Pembelajaran (Dipindah ke bawah video) */}
          <div style={{ padding: "0 24px 24px 24px", borderTop: "1px solid #e2e8f0", paddingTop: 20, marginTop: 4 }}>
            <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Modul Pembelajaran</h4>
            <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginBottom: 16 }}>
              Mahasiswa dapat membaca modul sambil menonton video.
            </p>
            {activeMaterial?.pdfUrl ? (
              <div style={{ display: "flex", gap: 16 }}>
                <a
                  href={activeMaterial.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", background: "#f1f5f9", color: "var(--md-on-surface)", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none", border: "1px solid #cbd5e1" }}
                >
                  📄 Baca / Download Modul
                </a>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                Modul PDF belum tersedia.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Aksi Pretest */}
        <div className="flex flex-col gap-6" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* B. Card Aksi Pretest */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>
              Soal Pretest ({activeMaterial?.courseName || "Materi Umum"})
            </h4>
            <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginBottom: 16, lineHeight: 1.5 }}>
              Pahami video pembelajaran dan modul pembelajaran secara saksama, lalu kerjakan soal pretest berikut. Jawaban yang telah dikirim tidak dapat diubah lagi.
            </p>

            {(showSuccessMessage || isCompleted) && !isRetaking ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
                  Nilai Pretest Anda: {activeProgress?.pretestScore !== undefined ? activeProgress.pretestScore : "?"}
                </h3>
                <p style={{ color: "var(--md-on-surface-variant)", fontSize: 14, marginBottom: 16 }}>
                  Jawaban benar: {activeProgress?.pretestAnswers?.filter((a: any) => a.isCorrect).length || 0} dari {activeMaterial?.pretestQuestions?.length || 0} soal
                </p>
                <div style={{ padding: "12px 16px", borderRadius: 8, background: activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 80 ? "#f0fdf4" : activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 60 ? "#fefce8" : "#fef2f2", marginBottom: 20 }}>
                  <p style={{ color: activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 80 ? "#166534" : activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 60 ? "#854d0e" : "#991b1b", fontWeight: 800, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                    {activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 80
                      ? "Sangat baik. Anda dapat melanjutkan ke materi berikutnya."
                      : activeProgress?.pretestScore !== undefined && activeProgress.pretestScore >= 60
                        ? "Cukup baik. Anda dapat melanjutkan, namun disarankan menonton ulang materi."
                        : "Perlu penguatan. Silakan menonton ulang video atau membaca modul sebelum melanjutkan."}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {materials.findIndex(m => m.id === activeMaterialId) === materials.length - 1 ? (
                    <>
                      <div style={{ padding: "16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, marginBottom: 8, textAlign: "center" }}>
                        <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>🎯</span>
                        <p style={{ fontWeight: 800, color: "#166534", fontSize: 14, margin: 0 }}>Semua Materi & Pretest Selesai!</p>
                      </div>
                      <button 
                        onClick={() => { 
                          setActiveMaterialId(materials[0].id);
                          const firstProg = progress.find(p => p.materialId === materials[0].id);
                          setShowPretest(firstProg?.isWatched && !firstProg?.isCompleted ? true : false);
                          setShowSuccessMessage(firstProg?.isCompleted ? true : false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{ background: "#f8fafc", color: "var(--md-on-surface)", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%" }}
                      >
                        Tinjau Ulang Materi
                      </button>
                      {!isGlobalCompleted && materials.every(m => progress.find(p => p.materialId === m.id)?.isCompleted) && (
                        <a 
                          href={`/dashboard/mahasiswa/asesmen/${klasterId}/ujian`}
                          style={{ background: "var(--md-primary)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%", textDecoration: "none", display: "inline-block" }}
                        >
                          Lanjut ke Ujian Kompetensi
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ background: "#f8fafc", color: "var(--md-on-surface)", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%" }}
                      >
                        Tonton Ulang Materi
                      </button>
                      <button 
                        onClick={handleNextMaterial}
                        style={{ background: "var(--md-primary)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%" }}
                      >
                        Lanjut ke Materi Berikutnya
                      </button>
                    </>
                  )}
                  {activeProgress?.pretestScore !== undefined && activeProgress.pretestScore < 100 && (
                    <button
                      onClick={() => {
                        setIsRetaking(true);
                        setAnswers({});
                      }}
                      style={{ background: "#fff", color: "#b45309", border: "1px solid #fde68a", padding: "10px 20px", borderRadius: 8, fontWeight: 800, cursor: "pointer", width: "100%" }}
                    >
                      🔄 Ulangi Pretest
                    </button>
                  )}
                </div>
              </div>
            ) : showPretest || isRetaking ? (
              <div style={{ display: "grid", gap: 20 }}>
                {activeMaterial?.pretestQuestions?.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#64748b", fontSize: 14 }}>Tidak ada pretest untuk materi ini.</div>
                ) : (
                  <div style={{ display: "grid", gap: 20 }}>
                    {activeMaterial?.pretestQuestions?.map((q, idx) => (
                      <div key={q.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 16, borderRadius: 12 }}>
                        <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{idx + 1}. {q.questionText}</p>
                        <div style={{ display: "grid", gap: 8 }}>
                          {q.options.map((opt) => (
                            <label key={opt.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: answers[q.id] === opt.label ? "#eff6ff" : "#fff", borderColor: answers[q.id] === opt.label ? "var(--md-primary)" : "#e2e8f0" }}>
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.label}
                                checked={answers[q.id] === opt.label}
                                onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                                style={{ marginTop: 2 }}
                              />
                              <span style={{ fontSize: 13 }}>{opt.label}. {opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => submitPretestMutation.mutate()}
                  disabled={submitPretestMutation.isPending || ((activeMaterial?.pretestQuestions?.length || 0) > 0 && Object.keys(answers).length < (activeMaterial?.pretestQuestions?.length || 0))}
                  style={{ background: "var(--md-primary)", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 800, cursor: "pointer", opacity: submitPretestMutation.isPending || ((activeMaterial?.pretestQuestions?.length || 0) > 0 && Object.keys(answers).length < (activeMaterial?.pretestQuestions?.length || 0)) ? 0.5 : 1, width: "100%", marginTop: 8 }}
                >
                  {submitPretestMutation.isPending ? "Menyimpan..." : "Submit Pretest"}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "var(--md-on-surface-variant)", marginBottom: 16 }}>
                  Silakan tonton video pembelajaran dan baca modul pembelajaran terlebih dahulu sebelum mengerjakan pretest.
                </p>
                <button
                  onClick={() => markWatchedMutation.mutate()}
                  disabled={markWatchedMutation.isPending}
                  style={{ background: "var(--md-primary)", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: "pointer", width: "100%", boxShadow: "0 4px 12px rgba(26,86,219,0.2)" }}
                >
                  {markWatchedMutation.isPending ? "Memproses..." : "Saya sudah menonton, lanjut pretest"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
