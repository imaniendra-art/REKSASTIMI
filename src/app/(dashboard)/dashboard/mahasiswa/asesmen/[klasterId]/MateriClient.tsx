"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearningStepper } from "./LearningStepper";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type TesData = {
  klaster: { 
    id: string; 
    namaKlaster: string; 
    lmsDeskripsi: string;
    lmsVideos?: string[];
    lmsDocuments?: { title: string; url: string }[];
    learningMaterials?: any[];
  };
  matkuls: any[];
  questions: any[];
  attemptStatus: string;
  learningProgress?: any[];
};

export function MateriClient({ klasterId }: { klasterId: string }) {
  const router = useRouter();
  const [stepperFinishedLocal, setStepperFinishedLocal] = React.useState(false);

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

  if (error) {
    const message = (error as Error).message;
    const isCompleted = message.includes("sudah menyelesaikan");
    return (
      <div style={{ width: "100%" }}>
        <PageHero tone="primary" title={isCompleted ? "Tes Sudah Selesai" : "Materi Belum Dapat Dibuka"} subtitle="" />
        <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 12, marginTop: 24 }}>
          <span style={{ fontSize: 40 }}>{isCompleted ? "✅" : "⚠️"}</span>
          <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "var(--md-on-surface)" }}>
            {isCompleted ? "Anda sudah menyelesaikan tes ini" : message}
          </h3>
          <Link href="/dashboard/mahasiswa/asesmen" style={{ display: "inline-block", marginTop: 16, background: "var(--md-primary)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Kembali ke Daftar Asesmen
          </Link>
        </div>
      </div>
    );
  }

  const tesData = tesDataWrapper?.data;

  if (isLoading || !tesData) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--md-on-surface-variant)" }}>
        Menyiapkan materi pembelajaran...
      </div>
    );
  }

  const videos = tesData.klaster.lmsVideos || [];
  const documents = tesData.klaster.lmsDocuments || [];
  const learningMaterials = tesData.klaster.learningMaterials || [];
  const learningProgress = tesData.learningProgress || [];
  const isCompleted = tesData.attemptStatus === "Completed";

  const isStepperActive = learningMaterials.length > 0;
  const isAllPretestsCompleted = !isStepperActive || learningMaterials.every((m: any) => {
    const prog = learningProgress.find((p: any) => p.materialId === m.id);
    if (!prog) return false;
    const activePretests = (m.pretestQuestions || []).filter((pq: any) => pq.isActive !== false);
    if (activePretests.length > 0) return prog.isCompleted === true;
    return prog.isWatched === true;
  });

  const stepperFinished = isAllPretestsCompleted || stepperFinishedLocal;

  return (
    <div style={{ width: "100%", paddingBottom: 100 }}>
      <PageHero
        tone="primary"
        title={tesData.klaster.namaKlaster}
        subtitle={isCompleted ? "Anda telah menyelesaikan asesmen ini. Anda tetap dapat mempelajari materi di bawah ini." : "Pelajari materi di bawah ini dengan saksama sebelum Anda memulai ujian/asesmen mandiri."}
      />

      <div className="md-card" style={{ padding: "32px", marginTop: 24, minHeight: 400 }}>
        {isCompleted && (
          <div style={{ marginBottom: 24, padding: "16px 20px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🎓</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#065f46" }}>Asesmen Selesai</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#047857", lineHeight: 1.5 }}>
                Nilai akhir Anda telah diterbitkan. Modul di bawah ini tetap dapat Anda akses kembali.
              </p>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 24 }}>
          Pengantar Modul Klaster
        </h2>
        
        <div style={{ 
          fontSize: 15, 
          lineHeight: 1.8, 
          color: "var(--md-on-surface)",
          whiteSpace: "pre-wrap",
          background: "#f8fafc",
          padding: "24px",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          marginBottom: 32
        }}>
          {tesData.klaster.lmsDeskripsi || "Belum ada materi pembelajaran yang disediakan untuk klaster ini."}
        </div>

        {isStepperActive ? (
          <LearningStepper 
            materials={learningMaterials}
            progress={learningProgress}
            klasterId={klasterId}
            onFinishAll={() => setStepperFinishedLocal(true)}
            isGlobalCompleted={isCompleted}
          />
        ) : (
          <>
            {videos.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 16 }}>
                  Video Pembelajaran
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {videos.map((vidUrl, idx) => {
                    const embedUrl = getYoutubeEmbedUrl(vidUrl);
                    const isYoutubeEmbed = embedUrl.includes("youtube.com/embed");

                    return (
                      <div key={idx} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "#000" }}>
                        {isYoutubeEmbed ? (
                          <iframe 
                            width="100%" 
                            height="200" 
                            src={embedUrl} 
                            title={`Video ${idx + 1}`} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{ display: "block" }}
                          ></iframe>
                        ) : (
                          <div style={{ padding: 20, textAlign: "center", background: "#f8fafc" }}>
                            <a href={vidUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--md-primary)", fontWeight: 700, textDecoration: "none" }}>
                              Tonton Video {idx + 1} &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 16 }}>
                  Materi Unduhan
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {documents.map((doc, idx) => (
                    <a 
                      key={idx} 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", 
                        borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc",
                        textDecoration: "none", color: "inherit", transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--md-primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                    >
                      <span style={{ fontSize: 24 }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--md-on-surface)" }}>
                          {doc.title || "Dokumen Pembelajaran"}
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--md-on-surface-variant)" }}>
                          Klik untuk melihat atau mengunduh file
                        </p>
                      </div>
                      <span style={{ color: "var(--md-primary)", fontWeight: 800, fontSize: 13 }}>Buka &rarr;</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}


        {!isCompleted && !isStepperActive && (
          <div style={{ marginTop: 40, padding: 24, background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#b45309", marginBottom: 8 }}>Perhatian Sebelum Ujian</h3>
            <ul style={{ paddingLeft: 20, margin: 0, color: "#92400e", fontSize: 14, lineHeight: 1.6 }}>
              <li>Pastikan Anda telah memahami materi pengantar di atas.</li>
              <li>Ujian terdiri dari pertanyaan pilihan ganda yang disesuaikan dengan mata kuliah.</li>
              <li>Jawaban yang sudah dikumpulkan tidak dapat diubah lagi.</li>
              <li>Siapkan waktu yang cukup, dan pastikan koneksi internet stabil.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, 
        background: "#fff", padding: "16px 24px", 
        borderTop: "1px solid #e2e8f0", boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        zIndex: 50
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--md-on-surface)", margin: 0 }}>
            {isCompleted ? "Asesmen ini telah diselesaikan." : "Sudah siap mengikuti ujian?"}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={() => router.push("/dashboard/mahasiswa/asesmen")}
            style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, color: "#64748b", background: "transparent", border: "1px solid #cbd5e1", cursor: "pointer" }}
          >
            Kembali
          </button>
          
          {isCompleted ? (
            <>
              <Link 
                href={`/dashboard/mahasiswa/asesmen/${klasterId}/hasil`}
                style={{ 
                  padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, 
                  background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", textDecoration: "none"
                }}
              >
                Lihat Hasil
              </Link>
              <Link 
                href={`/dashboard/mahasiswa/asesmen/${klasterId}/sertifikat`}
                style={{ 
                  padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 800, 
                  background: "var(--md-primary)", color: "#fff", border: "none", cursor: "pointer", textDecoration: "none"
                }}
              >
                🎓 Unduh Sertifikat
              </Link>
            </>
          ) : (
            <>
              {(!isStepperActive || stepperFinished) ? (
                <Link 
                  href={`/dashboard/mahasiswa/asesmen/${klasterId}/ujian`}
                  style={{ 
                    padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 800, 
                    background: "var(--md-primary)", color: "#fff", border: "none", cursor: "pointer", textDecoration: "none"
                  }}
                >
                  Mulai Ujian Sekarang
                </Link>
              ) : (
                <button 
                  disabled
                  style={{ 
                    padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 800, 
                    background: "#cbd5e1", color: "#64748b", border: "none", cursor: "not-allowed"
                  }}
                >
                  Selesaikan Materi Dulu
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
