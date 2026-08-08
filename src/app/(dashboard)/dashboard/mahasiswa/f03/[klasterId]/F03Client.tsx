"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/dashboard/UIComponents";

type FormValue = {
  tingkatKemampuan: string;
  jenisBukti: number[];
  buktiFileUrl: string;
};

function isFilled(value?: FormValue) {
  return !!value?.tingkatKemampuan && Array.isArray(value?.jenisBukti) && value.jenisBukti.length > 0;
}

function safeUrl(value?: string) {
  const url = value?.trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : "";
}

export default function F03Client({ klasterId }: { klasterId: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});

  useEffect(() => {
    fetch(`/api/mahasiswa/f03/${klasterId}?t=${new Date().getTime()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.reason || json.message || "Gagal mengambil data");
        return json;
      })
      .then((json) => {
        setData(json);

        const initialForm: Record<string, FormValue> = {};
        json.matkuls.forEach((m: any) => {
          const courseId = m._id.toString();
          const existing = json.existingF03.find((entry: any) => entry.courseId === courseId);
          initialForm[courseId] = {
            tingkatKemampuan: existing?.tingkatKemampuan || "",
            jenisBukti: existing?.jenisBukti || [],
            buktiFileUrl: existing?.buktiFileUrl || ""
          };
        });
        setFormValues(initialForm);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [klasterId]);

  const handleSelectBukti = (courseId: string, buktiId: number) => {
    setFormValues(prev => {
      const current = prev[courseId]?.jenisBukti || [];
      const nextJenisBukti = current.includes(buktiId)
        ? current.filter((id) => id !== buktiId)
        : [...current, buktiId];

      return {
        ...prev,
        [courseId]: {
          ...(prev[courseId] || { tingkatKemampuan: "", buktiFileUrl: "", jenisBukti: [] }),
          jenisBukti: nextJenisBukti
        }
      };
    });
  };

  const handleInputChange = (courseId: string, field: keyof FormValue, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || { tingkatKemampuan: "", buktiFileUrl: "", jenisBukti: [] }),
        [field]: value
      }
    }));
  };

  const saveF03 = async (isSubmitted: boolean) => {
    setSaving(true);

    const entries = Object.keys(formValues).map(courseId => ({
      courseId,
      ...formValues[courseId]
    }));

    try {
      const res = await fetch(`/api/mahasiswa/f03/${klasterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, isSubmitted })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      alert(isSubmitted ? "F03 berhasil diajukan permanen!" : "F03 berhasil disimpan sebagai draft!");
      if (isSubmitted) router.push("/dashboard/mahasiswa/f03");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const progress = useMemo(() => {
    const total = data?.matkuls?.length || 0;
    const filled = Object.values(formValues).filter(isFilled).length;
    const existing = data?.existingF03 || [];
    const submitted = existing.length > 0 && existing.every((entry: any) => entry.isSubmitted);
    const hasDraft = existing.length > 0 && !submitted;

    return {
      total,
      filled,
      empty: Math.max(total - filled, 0),
      percent: total > 0 ? Math.round((filled / total) * 100) : 0,
      label: submitted ? "Tersimpan" : hasDraft || filled > 0 ? "Draft" : "Belum Lengkap",
      submitted
    };
  }, [data, formValues]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Memuat form F03...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-black text-amber-700">
            !
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">F03 belum dapat diakses</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-800">
            {error || "F03 belum dapat diakses. Selesaikan Tes Kompetensi terlebih dahulu."}
          </p>
          <button
            onClick={() => router.push("/dashboard/mahasiswa/f03")}
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-300 bg-white px-5 text-sm font-bold text-amber-800 shadow-sm hover:bg-amber-100"
          >
            Kembali ke Daftar F03
          </button>
        </section>
      </main>
    );
  }

  return (
    <div style={{ width: "100%", margin: "0 auto", paddingBottom: 60 }}>

      <PageHero
        tone="secondary"
        badgeText="Evaluasi Diri / Portofolio"
        title={data.klaster.namaKlaster}
        subtitle="Lengkapi evaluasi diri dan bukti portofolio untuk setiap mata kuliah yang diklaim pada F02."
        rightContent={
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[
              { label: "Nomor Sertifikat", value: data.attempt?.certificateNumber || "Belum tersedia", mono: true },
              { label: "Tes Kompetensi", value: "Selesai", mono: false },
              { label: "Progress F03", value: `${progress.percent}%`, mono: true },
              { label: "Status", value: progress.label, mono: false },
            ].map((info) => (
              <div key={info.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: 3 }}>
                  {info.label}
                </p>
                <p style={{ fontWeight: 800, fontSize: 13, fontFamily: info.mono ? "monospace" : "inherit" }}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {data.matkuls.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">Mata kuliah belum tersedia</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Belum ada mata kuliah yang dapat diisi pada F03 klaster ini.</p>
            </section>
          ) : (
            data.matkuls.map((m: any, index: number) => {
              const courseId = m._id.toString();
              const value = formValues[courseId];
              const complete = isFilled(value);
              const evidenceUrl = safeUrl(value?.buktiFileUrl);

              return (
                <section key={courseId} className="md-card" style={{ overflow: "hidden", marginBottom: 24 }}>
                  {/* Header Card */}
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--md-outline-variant)", background: "var(--md-surface-2)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                      <span className="md-chip" style={{ fontWeight: 800, fontSize: 12, padding: "4px 10px" }}>
                        Mata Kuliah {index + 1}
                      </span>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
                        background: complete ? "var(--md-success-container)" : "var(--md-error-container)",
                        color: complete ? "var(--md-success)" : "var(--md-error)",
                        border: `1px solid ${complete ? "#6ee7b7" : "#fca5a5"}`,
                      }}>
                        {complete ? "✓ Lengkap" : "Belum Lengkap"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {(() => {
                        const res = data.attempt?.matkulResults?.find((r: any) => String(r.matkulId) === courseId);
                        if (res && res.finalGrade) {
                          return (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#fff", border: "1.5px solid var(--md-outline)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>
                              Nilai Tes: <strong style={{ fontSize: 14, color: "var(--md-primary)" }}>{res.finalGrade}</strong>
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {evidenceUrl && (
                        <a
                          href={evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", padding: "4px 12px",
                            borderRadius: "var(--md-radius-full)", background: "var(--md-primary-container)",
                            color: "var(--md-primary)", fontSize: 11, fontWeight: 800, border: "1px solid var(--md-outline-variant)"
                          }}
                        >
                          Buka Bukti &rarr;
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body Card */}
                  <div style={{ padding: "20px 24px 28px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                      <div style={{ flex: "1 1 500px" }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 2, lineHeight: 1.3 }}>{m.namaMatkul}</h2>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--md-on-surface-variant)" }}>{m.kode || "Kode belum tersedia"}</p>
                        
                        {m.deskripsi && (
                          <div style={{ marginTop: 12, padding: "12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, lineHeight: 1.6, color: "var(--md-on-surface)" }}>
                            <strong style={{ display: "block", marginBottom: 4, color: "var(--md-on-surface-variant)" }}>Deskripsi:</strong>
                            {m.deskripsi}
                          </div>
                        )}

                        {m.cpmkList && m.cpmkList.length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <strong style={{ fontSize: 12, color: "var(--md-on-surface-variant)", marginBottom: 6, display: "block" }}>Capaian Pembelajaran (CPMK):</strong>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: "var(--md-on-surface)" }}>
                              {m.cpmkList.map((c: any) => (
                                <li key={c._id} style={{ marginBottom: 4 }}>{c.deskripsiCpmk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Input: Tingkat Kemampuan & Link Bukti (Diperkecil / Dibuat Sebelah Kanan jika layar lebar) */}
                      <div style={{ flex: "0 1 340px", width: "100%", display: "flex", flexDirection: "column", gap: 16, background: "var(--md-surface-2)", padding: 16, borderRadius: 12, border: "1px solid var(--md-outline-variant)" }}>
                        <div>
                          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 6 }}>
                            <span>Tingkat Kemampuan</span>
                          </label>
                          <select
                            style={{
                              width: "100%", height: 40, padding: "0 12px", borderRadius: "var(--md-radius-sm)",
                              border: "1px solid var(--md-outline)", background: "#fff",
                              fontSize: 13, fontWeight: 700, color: "var(--md-on-surface)", outline: "none",
                              transition: "border-color 180ms, box-shadow 180ms",
                            }}
                            value={value?.tingkatKemampuan || ""}
                            onChange={(e) => handleInputChange(courseId, "tingkatKemampuan", e.target.value)}
                            onFocus={e => { e.target.style.borderColor = "var(--md-primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(26,86,219,0.12)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--md-outline)"; e.target.style.boxShadow = "none"; }}
                          >
                            <option value="" disabled>Pilih tingkat kemampuan</option>
                            {["Sangat Baik", "Baik", "Cukup", "Kurang"].map(k => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 6 }}>
                            Link Bukti Portofolio
                          </label>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={value?.buktiFileUrl || ""}
                            onChange={(e) => handleInputChange(courseId, "buktiFileUrl", e.target.value)}
                            style={{
                              width: "100%", height: 40, padding: "0 12px", borderRadius: "var(--md-radius-sm)",
                              border: "1px solid var(--md-outline)", background: "#fff",
                              fontSize: 13, fontWeight: 600, color: "var(--md-on-surface)", outline: "none",
                              transition: "border-color 180ms, box-shadow 180ms",
                            }}
                            onFocus={e => { e.target.style.borderColor = "var(--md-primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(26,86,219,0.12)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--md-outline)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Jenis Bukti Grid (Lebih Padat) */}
                    <div>
                      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px dashed var(--md-outline)" }}>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 2 }}>
                          Jenis Bukti Portofolio <span style={{ fontWeight: 600, color: "var(--md-on-surface-variant)", fontSize: 11 }}>(Pilih satu atau lebih)</span>
                        </h3>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                        {data.jenisBuktiList.map((bukti: any) => {
                          const checked = !!value?.jenisBukti?.includes(bukti.id);
                          const numberStr = String(bukti.id).padStart(2, "0");
                          return (
                            <label
                              key={bukti.id}
                              style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "6px 10px", minHeight: 36,
                                borderRadius: 8,
                                border: checked ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                                background: checked ? "var(--md-primary-container)" : "var(--md-surface-1)",
                                cursor: "pointer",
                                transition: "all 150ms ease",
                              }}
                              onMouseEnter={e => { if (!checked) { (e.currentTarget as HTMLElement).style.background = "var(--md-surface-2)"; }}}
                              onMouseLeave={e => { if (!checked) { (e.currentTarget as HTMLElement).style.background = "var(--md-surface-1)"; }}}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleSelectBukti(courseId, bukti.id)}
                                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                              />
                              <span style={{
                                width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 9, fontWeight: 800, flexShrink: 0,
                                background: checked ? "var(--md-primary)" : "var(--md-surface-2)",
                                color: checked ? "#fff" : "var(--md-on-surface-variant)",
                                border: checked ? "none" : "1px solid var(--md-outline)",
                                transition: "background 150ms, color 150ms",
                              }}>
                                {checked ? "✓" : numberStr}
                              </span>
                              <span style={{
                                flex: 1, fontSize: 11, lineHeight: 1.3,
                                fontWeight: checked ? 800 : 600,
                                color: checked ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                              }}>
                                {bukti.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </section>
              );
            })
          )}
        </div>

        <aside className="exam-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 96 }}>
          <div className="md-card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-primary)", letterSpacing: "0.05em", marginBottom: 4 }}>Ringkasan Progres</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--md-on-surface)" }}>Kelengkapan F03</h2>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "Total", value: progress.total, bg: "var(--md-surface-2)", color: "var(--md-on-surface)" },
                { label: "Diisi", value: progress.filled, bg: "var(--md-success-container)", color: "var(--md-success)" },
                { label: "Belum", value: progress.empty, bg: "var(--md-error-container)", color: "var(--md-error)" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: "30%", textAlign: "center", padding: "12px 8px", borderRadius: "var(--md-radius-md)", background: s.bg }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, opacity: 0.85, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--md-on-surface-variant)", marginBottom: 8 }}>
                <span>Status Kelengkapan</span>
                <span style={{ color: "var(--md-primary)" }}>{progress.percent}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: "var(--md-outline-variant)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--md-primary), var(--md-secondary))", width: `${progress.percent}%`, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ marginTop: 12, display: "inline-flex", minHeight: 32, alignItems: "center", borderRadius: "var(--md-radius-sm)", background: "var(--md-surface-2)", padding: "0 12px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--md-on-surface)" }}>
                {progress.label}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => saveF03(false)}
                disabled={saving}
                className="md-btn-outlined"
                style={{ width: "100%", padding: "12px 16px", fontSize: 13, fontWeight: 800, borderRadius: "var(--md-radius-full)", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                onClick={() => saveF03(true)}
                disabled={saving}
                className="md-btn"
                style={{ width: "100%", padding: "12px 16px", fontSize: 13, fontWeight: 800, borderRadius: "var(--md-radius-full)", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Menyimpan..." : "Simpan F03"}
              </button>
              <Link
                href={`/mahasiswa/cetak-f03/${klasterId}`}
                className="md-btn"
                style={{ width: "100%", display: "inline-flex", justifyContent: "center", padding: "12px 16px", fontSize: 13, fontWeight: 800, borderRadius: "var(--md-radius-full)", background: "var(--md-success)", color: "#fff" }}
              >
                Cetak F03
              </Link>
              <button
                onClick={() => router.push("/dashboard/mahasiswa/f03")}
                className="md-btn-outlined"
                style={{ width: "100%", padding: "12px 16px", fontSize: 13, fontWeight: 800, borderRadius: "var(--md-radius-full)", border: "1.5px solid var(--md-outline)", color: "var(--md-on-surface-variant)" }}
              >
                Kembali
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
