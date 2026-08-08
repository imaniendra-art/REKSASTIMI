"use client";

import { useEffect, useState, use } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CourseF03Data = {
  matkulId: string;
  kode: string;
  nama: string;
  sks: number;
  deskripsiMatkul: string;
  cplCpmk: string;
  f03EvaluasiId: string | null;
  tingkatKemampuan: string | null;
  jenisBukti: number[];
  buktiFileUrl: string | null;
  statusValidasi: string[];
  nilaiHuruf: string | null;
  catatanPenilai: string | null;
  tanggalPenilaian: string;
  waktuPenilaian: string;
  lokasiPenilaian: string;
  penilai1: string;
  penilai2: string;
  status: "Belum Dinilai" | "Sebagian" | "Sudah Dinilai";
};

type DetailData = {
  plotting: any;
  student: { id: string; name: string; username: string; concentration?: string };
  klaster: { id: string; name: string };
  courses: CourseF03Data[];
};

export default function PenilaiF03DetailPage({ params }: { params: Promise<{ plottingId: string }> }) {
  const router = useRouter();
  const { plottingId } = use(params);
  
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Local state for the form
  const [evaluations, setEvaluations] = useState<Record<string, {
    vatm: string[];
    nilaiHuruf: string;
    catatanPenilai: string;
    tanggalPenilaian: string;
    waktuPenilaian: string;
    lokasiPenilaian: string;
    penilai1: string;
    penilai2: string;
  }>>({});

  const syncScheduleToAll = (matkulId: string) => {
    const source = evaluations[matkulId];
    if (!source) return;
    setEvaluations(prev => {
      const next = { ...prev };
      for (const key in next) {
        if (key !== matkulId) {
          next[key] = {
            ...next[key],
            tanggalPenilaian: source.tanggalPenilaian,
            waktuPenilaian: source.waktuPenilaian,
            lokasiPenilaian: source.lokasiPenilaian,
            penilai1: source.penilai1,
            penilai2: source.penilai2,
          };
        }
      }
      return next;
    });
  };

  useEffect(() => {
    fetchData();
  }, [plottingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/penilai/f03/${plottingId}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Akses ditolak: Ini bukan data plotting Anda.");
        throw new Error("Gagal mengambil data F03");
      }
      const json = await res.json();
      
      const detail: DetailData = json.data;
      setData(detail);

      // Initialize local state
      const initialEvals: any = {};
      detail.courses.forEach(c => {
        initialEvals[c.matkulId] = {
          vatm: c.statusValidasi || [],
          nilaiHuruf: c.nilaiHuruf || "",
          catatanPenilai: c.catatanPenilai || "",
          tanggalPenilaian: c.tanggalPenilaian || "",
          waktuPenilaian: c.waktuPenilaian || "",
          lokasiPenilaian: c.lokasiPenilaian || "",
          penilai1: c.penilai1 || "",
          penilai2: c.penilai2 || ""
        };
      });
      setEvaluations(initialEvals);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVatmChange = (matkulId: string, letter: string, checked: boolean) => {
    setEvaluations(prev => {
      const current = prev[matkulId].vatm;
      const updated = checked ? [...current, letter] : current.filter(l => l !== letter);
      return { ...prev, [matkulId]: { ...prev[matkulId], vatm: updated } };
    });
  };

  const handleSelectAllVatm = (matkulId: string) => {
    setEvaluations(prev => ({
      ...prev,
      [matkulId]: { ...prev[matkulId], vatm: ["V", "A", "T", "M"] }
    }));
  };

  const handleNilaiChange = (matkulId: string, value: string) => {
    const gradeToNum: Record<string, string> = { "A": "85", "A-": "80", "B+": "75", "B": "70", "B-": "65", "C": "60", "D": "50", "E": "40" };
    const autoCatatan = value ? `Berdasarkan bukti yang dilampirkan dan wawancara yang dilakukan maka mahasiswa diberi nilai ${gradeToNum[value]} (${value})` : "";
    setEvaluations(prev => ({
      ...prev,
      [matkulId]: { 
        ...prev[matkulId], 
        nilaiHuruf: value,
        catatanPenilai: prev[matkulId].catatanPenilai ? prev[matkulId].catatanPenilai : autoCatatan 
      }
    }));
  };

  const handleFieldChange = (matkulId: string, field: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [matkulId]: { ...prev[matkulId], [field]: value }
    }));
  };

  const handleCatatanChange = (matkulId: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [matkulId]: { ...prev[matkulId], catatanPenilai: value }
    }));
  };

  const handleSave = async () => {
    if (!data) return;
    
    setSaving(true);
    setMessage("");
    setError("");

    try {
      // Build payload
      const entries = data.courses.map(c => {
        const ev = evaluations[c.matkulId];
        if (!ev.catatanPenilai.trim()) {
          throw new Error(`Catatan / Justifikasi Penilai untuk matkul ${c.nama} wajib diisi!`);
        }
        return {
          f03EvaluasiId: c.f03EvaluasiId,
          courseId: c.matkulId,
          vatm: ev.vatm,
          nilaiHuruf: ev.nilaiHuruf,
          catatanPenilai: ev.catatanPenilai,
          tanggalPenilaian: ev.tanggalPenilaian,
          waktuPenilaian: ev.waktuPenilaian,
          lokasiPenilaian: ev.lokasiPenilaian,
          penilai1: ev.penilai1,
          penilai2: ev.penilai2
        };
      }).filter(e => e.f03EvaluasiId !== null); // Only send ones the student actually submitted

      const res = await fetch(`/api/penilai/f03/${plottingId}/nilai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan penilaian");

      setMessage("Penilaian berhasil disimpan!");
      setTimeout(() => setMessage(""), 4000);
      
      // Refresh data
      fetchData();
      
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0,0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Memuat detail F03...</div>;
  if (error && !data) return (
    <div style={{ padding: 24 }}>
      <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, fontWeight: 700 }}>
        {error}
      </div>
      <Link href="/dashboard/penilai" style={{ display: "inline-block", marginTop: 16, color: "var(--md-primary)" }}>&larr; Kembali ke Dashboard</Link>
    </div>
  );

  if (!data) return null;

  const totalMatkul = data.courses.length;
  const sudahDinilai = data.courses.filter(c => c.status === "Sudah Dinilai").length;
  const belumDinilai = totalMatkul - sudahDinilai;

  const inputStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" };

  return (
    <div style={{ width: "100%", paddingBottom: 60 }}>
      <PageHero
        badgeText="Evaluasi Portofolio"
        title="Penilaian F03"
        subtitle="Verifikasi bukti portofolio mahasiswa (VATM) dan berikan nilai huruf per mata kuliah."
        tone="warning"
      />

      {message && (
        <div style={{ padding: 16, background: "#dcfce7", color: "#166534", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Info Mahasiswa & Klaster */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
        <div className="md-card" style={{ flex: 1, padding: 24, minWidth: 300 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>Informasi Mahasiswa</h3>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, fontSize: 14 }}>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Nama:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.student.name}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>NIM/Username:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.student.username}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Konsentrasi:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{data.student.concentration || "Belum dipilih"}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Klaster:</div>
            <div style={{ fontWeight: 800, color: "var(--md-primary)" }}>{data.klaster.name}</div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Jml Matkul RPL:</div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{totalMatkul} Mata Kuliah</div>
          </div>
        </div>

        <div className="md-card" style={{ flex: 1, padding: 24, minWidth: 300, background: "linear-gradient(to right bottom, #f8fafc, #f1f5f9)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>Ringkasan Evaluasi</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#64748b", fontWeight: 600, fontSize: 14 }}>Total Mata Kuliah:</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{totalMatkul}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#166534", fontWeight: 600, fontSize: 14 }}>Sudah Dinilai:</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#166534" }}>{sudahDinilai}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#991b1b", fontWeight: 600, fontSize: 14 }}>Belum Dinilai:</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#991b1b" }}>{belumDinilai}</span>
          </div>
        </div>
      </div>

      {/* Daftar Mata Kuliah */}
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Formulir Penilaian F03</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {data.courses.map((course, index) => {
          const evalState = evaluations[course.matkulId];
          const hasF03 = course.f03EvaluasiId !== null;

          return (
            <div key={course.matkulId} className="md-card" style={{ padding: "16px 20px", borderLeft: hasF03 ? "4px solid var(--md-primary)" : "4px solid #cbd5e1" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 20 }}>
                
                {/* KIRI: Informasi Mata Kuliah */}
                <div style={{ paddingTop: 16 }}>
                  <h5 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", margin: 0, marginBottom: 16, letterSpacing: "0.5px", lineHeight: "24px" }}>INFORMASI MATA KULIAH</h5>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, marginBottom: 6 }}>
                    {index + 1}. {course.nama}
                  </h4>
                  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#f1f5f9", borderRadius: 6, color: "#475569", marginBottom: 12 }}>
                    {course.kode} ({course.sks} SKS)
                  </span>
                  
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ display: "block", color: "#334155" }}>Deskripsi:</strong>
                      {course.deskripsiMatkul}
                    </div>
                    <div>
                      <strong style={{ display: "block", color: "#334155" }}>CPL / CPMK:</strong>
                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {course.cplCpmk}
                      </div>
                    </div>
                  </div>

                  {!hasF03 && (
                    <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 16, padding: "8px 12px", background: "#fef2f2", borderRadius: 8 }}>
                      ⚠️ Mahasiswa belum mensubmit data F03.
                    </div>
                  )}
                  
                  <div style={{ 
                    marginTop: 16,
                    display: "inline-block",
                    padding: "6px 12px", 
                    borderRadius: 8, 
                    fontSize: 12, 
                    fontWeight: 800,
                    background: course.status === "Sudah Dinilai" ? "#dcfce7" : course.status === "Sebagian" ? "#fef08a" : "#f1f5f9",
                    color: course.status === "Sudah Dinilai" ? "#166534" : course.status === "Sebagian" ? "#854d0e" : "#64748b"
                  }}>
                    Status Penilaian: {course.status}
                  </div>
                </div>

                {/* TENGAH: Isian Mahasiswa */}
                {hasF03 ? (
                  <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                    <h5 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", margin: 0, marginBottom: 16, letterSpacing: "0.5px", lineHeight: "24px" }}>ISIAN MAHASISWA</h5>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>Tingkat Kemampuan:</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{course.tingkatKemampuan || "-"}</div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>Jenis Bukti (ID):</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {course.jenisBukti.length > 0 ? course.jenisBukti.join(", ") : "-"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>File Bukti Portofolio:</div>
                      {course.buktiFileUrl ? (
                        <a 
                          href={course.buktiFileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            display: "inline-flex", alignItems: "center", padding: "6px 12px", 
                            background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none",
                            marginBottom: 12
                          }}
                        >
                          Buka Berkas ↗
                        </a>
                      ) : (
                        <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", marginBottom: 12 }}>Tidak ada link berkas</div>
                      )}

                      <div style={{ padding: "12px 0 0", borderTop: "1px dashed #cbd5e1" }}>
                        <h5 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>Evaluasi Penilai</h5>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Validasi Bukti (VATM):</label>
                            <button 
                              type="button" 
                              onClick={() => handleSelectAllVatm(course.matkulId)}
                              style={{ 
                                fontSize: 10, fontWeight: 800, color: "var(--md-primary)", 
                                background: "var(--md-primary-container)", border: "1px solid rgba(13, 148, 136, 0.3)", 
                                padding: "4px 12px", borderRadius: 20, cursor: "pointer",
                                transition: "all 0.2s ease", letterSpacing: "0.5px"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = "var(--md-primary)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "var(--md-primary-container)"}
                              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-primary)"}
                            >
                              CHECK ALL
                            </button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {[
                              { val: "V", label: "Valid" },
                              { val: "A", label: "Asli" },
                              { val: "T", label: "Terkini" },
                              { val: "M", label: "Memadai" }
                            ].map(item => {
                              const isChecked = evalState.vatm.includes(item.val);
                              return (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => handleVatmChange(course.matkulId, item.val, !isChecked)}
                                  style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    padding: "8px 4px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    background: isChecked ? "var(--md-primary)" : "#f1f5f9",
                                    color: isChecked ? "#fff" : "#64748b",
                                    border: isChecked ? "1px solid var(--md-primary)" : "1px solid #e2e8f0",
                                    boxShadow: isChecked ? "0 4px 12px rgba(13, 148, 136, 0.3)" : "none",
                                    transform: isChecked ? "translateY(-2px)" : "none"
                                  }}
                                >
                                  <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1 }}>{item.val}</span>
                                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: 4, opacity: isChecked ? 0.95 : 0.6 }}>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Belum ada data</span>
                  </div>
                )}

                {/* KANAN: Evaluasi Penilai */}
                {hasF03 ? (
                  <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }}>
                    
                    {/* Informasi Asesmen Grid */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h5 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, lineHeight: "24px" }}>INFORMASI PELAKSANAAN ASESMEN</h5>
                      <button 
                        onClick={() => syncScheduleToAll(course.matkulId)}
                        type="button" 
                        style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", height: "24px", display: "flex", alignItems: "center" }}
                        title="Terapkan jadwal ini ke semua mata kuliah lainnya"
                      >
                        Sync ke Semua
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, fontSize: 11, background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                      <div>
                        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 2 }}>Tanggal:</div>
                        <input type="date" value={evalState.tanggalPenilaian} onChange={(e) => handleFieldChange(course.matkulId, "tanggalPenilaian", e.target.value)} style={{ ...inputStyle, width: "100%", padding: "4px 6px", fontSize: 12 }} />
                      </div>
                      <div>
                        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 2 }}>Waktu:</div>
                        <input type="time" value={evalState.waktuPenilaian} onChange={(e) => handleFieldChange(course.matkulId, "waktuPenilaian", e.target.value)} style={{ ...inputStyle, width: "100%", padding: "4px 6px", fontSize: 12 }} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 2 }}>Tempat / Lokasi:</div>
                        <input type="text" value={evalState.lokasiPenilaian} onChange={(e) => handleFieldChange(course.matkulId, "lokasiPenilaian", e.target.value)} placeholder="Contoh: Ruang Asesmen Daring" style={{ ...inputStyle, width: "100%", padding: "4px 6px", fontSize: 12 }} />
                      </div>
                      <div>
                        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 2 }}>Penilai 1:</div>
                        <input type="text" value={evalState.penilai1} onChange={(e) => handleFieldChange(course.matkulId, "penilai1", e.target.value)} placeholder="Otomatis" style={{ ...inputStyle, width: "100%", padding: "4px 6px", fontSize: 12 }} />
                      </div>
                      <div>
                        <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 2 }}>Penilai 2:</div>
                        <input type="text" value={evalState.penilai2} onChange={(e) => handleFieldChange(course.matkulId, "penilai2", e.target.value)} placeholder="Opsional" style={{ ...inputStyle, width: "100%", padding: "4px 6px", fontSize: 12 }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Nilai Huruf */}
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>Nilai Huruf:</label>
                        <select 
                          style={{ ...inputStyle, width: "100%", fontWeight: 700, padding: "6px" }}
                          value={evalState.nilaiHuruf}
                          onChange={(e) => handleNilaiChange(course.matkulId, e.target.value)}
                        >
                          <option value="">-- Pilih Nilai --</option>
                          {["A", "A-", "B+", "B", "B-", "C", "D", "E"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      {/* Catatan Penilai */}
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#b91c1c", fontWeight: 800, marginBottom: 4 }}>Catatan / Justifikasi Penilai (Wajib):</label>
                        <textarea 
                          style={{ ...inputStyle, width: "100%", resize: "vertical", minHeight: 40, border: "1px solid #fca5a5", padding: "6px", fontSize: 12 }}
                          value={evalState.catatanPenilai}
                          onChange={(e) => handleCatatanChange(course.matkulId, e.target.value)}
                          placeholder="Tuliskan catatan justifikasi penilaian..."
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Terkunci (Belum ada F03)</span>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save Button */}
      <div style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, 
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", 
        padding: "16px 24px", borderTop: "1px solid #e2e8f0", 
        display: "flex", justifyContent: "flex-end", zIndex: 100 
      }}>
        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button 
            onClick={fetchData}
            style={{ padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#f1f5f9", color: "#475569", border: "none", cursor: "pointer" }}
            disabled={saving}
          >
            Batal / Reset
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: "12px 32px", borderRadius: 8, fontSize: 14, fontWeight: 800, background: "var(--md-primary)", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Penilaian"}
          </button>
        </div>
      </div>
    </div>
  );
}
