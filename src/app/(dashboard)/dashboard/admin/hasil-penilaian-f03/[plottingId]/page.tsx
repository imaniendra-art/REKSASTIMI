"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDetailHasilPenilaianPage() {
  const { plottingId } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [plottingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/hasil-penilaian-f03/${plottingId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        if (json.data?.konfirmasi?.catatanAdmin) {
            setCatatanAdmin(json.data.konfirmasi.catatanAdmin);
        }
      } else {
        setErrorMsg("Gagal memuat data detail.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Terjadi kesalahan sistem saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "konfirmasi" | "kembalikan") => {
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/hasil-penilaian-f03/${plottingId}/konfirmasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catatanAdmin })
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.message || "Gagal memproses permintaan.");
      } else {
        setSuccessMsg(json.message);
        await fetchData(); // Reload data to show updated confirmation status
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Terjadi kesalahan saat menyimpan konfirmasi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-4xl animate-pulse text-blue-500 mb-4">⏳</span>
        <p className="text-slate-500">Memuat detail hasil penilaian...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <p>Data tidak ditemukan. Silakan kembali ke halaman sebelumnya.</p>
        </div>
        <Link href="/dashboard/admin/hasil-penilaian-f03" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
            ← Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const { student, klaster, penilai, progress, konfirmasi, courses, plotting } = data;
  const isLengkap = progress.totalSudahDinilai === progress.totalMatkul && progress.totalMatkul > 0;
  const isDikonfirmasi = konfirmasi?.status === "Dikonfirmasi";

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/admin/hasil-penilaian-f03" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors text-xl leading-none">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Detail Hasil Penilaian F03
            {isDikonfirmasi && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs rounded-full flex items-center gap-1.5 font-medium">
                    ✓ Telah Dikonfirmasi
                </span>
            )}
            {konfirmasi?.status === "Dikembalikan" && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 border border-rose-200 text-xs rounded-full flex items-center gap-1.5 font-medium">
                    ⚠️ Dikembalikan ke Penilai
                </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Review hasil evaluasi VATM dan nilai huruf yang telah diinput oleh Penilai.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Calon Asesi / Mahasiswa</p>
                    <p className="font-bold text-lg text-slate-800">{student.name}</p>
                    <p className="text-slate-600 text-sm">{student.username} • {student.concentration}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Klaster Kompetensi</p>
                    <p className="font-medium text-slate-800">{klaster.name}</p>
                </div>
            </div>
            <div className="h-full w-px bg-slate-200 hidden md:block"></div>
            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ditugaskan Kepada Penilai</p>
                    <p className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block border border-blue-100">{penilai.name}</p>
                    <p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">🕒 Sejak {new Date(plotting.assignedAt).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Progress Penilaian</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isLengkap ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                    {isLengkap ? "LENGKAP" : "BELUM LENGKAP"}
                </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 border border-slate-200 overflow-hidden">
                <div 
                    className={`h-3 rounded-full transition-all duration-500 ${isLengkap ? "bg-emerald-500" : "bg-blue-500"}`} 
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between text-sm">
                <div className="text-slate-600"><strong className="text-slate-800">{progress.totalSudahDinilai}</strong> dari {progress.totalMatkul} Mata Kuliah telah dinilai.</div>
                <div className="font-bold text-slate-800">{progress.percentage}%</div>
            </div>
          </div>
        </div>

        {/* Panel Konfirmasi */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    ✓ Konfirmasi Hasil
                </h3>
                
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg mb-4">
                        {successMsg}
                    </div>
                )}

                {!isLengkap && !isDikonfirmasi && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-lg mb-4 flex gap-2">
                        <span className="shrink-0 text-lg leading-none">⚠️</span>
                        <p>Penilaian belum lengkap. Anda belum dapat mengonfirmasi hasil ini sebelum seluruh mata kuliah diberi nilai oleh Penilai.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Admin (Opsional)</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                            placeholder="Tambahkan catatan jika diperlukan..."
                            value={catatanAdmin}
                            onChange={(e) => setCatatanAdmin(e.target.value)}
                            disabled={isDikonfirmasi || submitting}
                        ></textarea>
                    </div>

                    {!isDikonfirmasi ? (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleAction("konfirmasi")}
                                disabled={!isLengkap || submitting}
                                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                                    !isLengkap 
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow"
                                }`}
                            >
                                {submitting ? "⏳ " : "✓ "}
                                Konfirmasi Hasil
                            </button>
                            <button
                                onClick={() => handleAction("kembalikan")}
                                disabled={submitting}
                                className="w-full py-2 bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition-all"
                            >
                                Kembalikan ke Penilai
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-800 mb-1">Telah Dikonfirmasi Oleh</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{konfirmasi.confirmedByName.charAt(0)}</span>
                                {konfirmasi.confirmedByName}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">Pada: {new Date(konfirmasi.confirmedAt).toLocaleString('id-ID')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Rincian Evaluasi */}
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Rincian Evaluasi per Mata Kuliah</h2>
      <div className="space-y-6">
        {courses.map((course: any, idx: number) => {
            const hasVatm = course.statusValidasi && course.statusValidasi.length > 0;
            const hasNilai = !!course.nilaiHuruf;
            const isAssessed = hasVatm && hasNilai;
            
            return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                    {/* Course Info */}
                    <div className="w-full md:w-1/3 bg-slate-50 p-5 border-r border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                                {course.kode}
                            </span>
                            <span className="text-xs font-medium text-slate-500">{course.sks} SKS</span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{course.nama}</h4>
                        <div className="text-xs text-slate-600 space-y-2 mb-4">
                            <p><strong>Deskripsi:</strong><br/>{course.deskripsiMatkul}</p>
                            <div>
                                <strong>CPL / CPMK:</strong>
                                <div style={{ whiteSpace: "pre-wrap", marginTop: 2 }}>{course.cplCpmk}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Assessment Info */}
                    <div className="w-full md:w-2/3 p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h5 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Hasil Validasi Penilai</h5>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isAssessed ? "bg-emerald-100 text-emerald-700" :
                                (hasVatm || course.catatanPenilai) ? "bg-orange-100 text-orange-700" :
                                "bg-slate-100 text-slate-500"
                            }`}>
                                {course.status}
                            </span>
                        </div>

                        {/* Mahasiswa Claim & Proof */}
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Klaim Kemampuan (Isian Mahasiswa):</p>
                                <p className="font-medium text-slate-800 text-sm capitalize">{course.tingkatKemampuan || "-"}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Bukti Portofolio (VATM):</p>
                                {course.buktiFileUrl ? (
                                    <a href={course.buktiFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-md hover:border-blue-400 transition-colors">
                                        📄 Lihat Dokumen Bukti
                                    </a>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">Tidak ada file</span>
                                )}
                            </div>
                        </div>

                        {/* VATM & Nilai */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="border border-slate-200 p-4 rounded-lg bg-white">
                                <p className="text-xs text-slate-500 mb-2 font-medium uppercase">Validasi VATM</p>
                                <div className="flex gap-2">
                                    {['V', 'A', 'T', 'M'].map(letter => {
                                        const isChecked = course.statusValidasi?.includes(letter);
                                        return (
                                            <div key={letter} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${isChecked ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                {letter}
                                            </div>
                                        )
                                    })}
                                </div>
                                {(!course.statusValidasi || course.statusValidasi.length === 0) && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">⚠️ Penilai belum melakukan validasi VATM</p>
                                )}
                            </div>
                            
                            <div className="border border-slate-200 p-4 rounded-lg bg-white flex flex-col justify-center items-center text-center">
                                <p className="text-xs text-slate-500 mb-2 font-medium uppercase">Nilai Huruf</p>
                                {course.nilaiHuruf ? (
                                    <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-black shadow-md">
                                        {course.nilaiHuruf}
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center text-xl font-bold">
                                        ?
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="border border-slate-200 p-4 rounded-lg bg-orange-50/30">
                            <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Catatan / Justifikasi Penilai</p>
                            <p className="text-sm text-slate-800 italic">
                                {course.catatanPenilai ? `"${course.catatanPenilai}"` : <span className="text-slate-400">Belum ada catatan dari penilai.</span>}
                            </p>
                            
                            {/* Schedule info if exists */}
                            {(course.tanggalPenilaian || course.lokasiPenilaian) && (
                                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500">
                                    {course.tanggalPenilaian && <div><strong>Tgl:</strong> {new Date(course.tanggalPenilaian).toLocaleDateString('id-ID')} {course.waktuPenilaian}</div>}
                                    {course.lokasiPenilaian && <div><strong>Lokasi:</strong> {course.lokasiPenilaian}</div>}
                                    {course.penilai1 && <div><strong>Penilai:</strong> {course.penilai1} {course.penilai2 ? `& ${course.penilai2}` : ''}</div>}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
