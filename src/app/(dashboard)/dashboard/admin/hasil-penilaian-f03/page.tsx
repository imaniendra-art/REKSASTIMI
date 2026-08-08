"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminHasilPenilaianPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [konfirmasiFilter, setKonfirmasiFilter] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter) query.append("statusPenilaian", statusFilter);
      if (konfirmasiFilter) query.append("statusKonfirmasi", konfirmasiFilter);

      const res = await fetch(`/api/admin/hasil-penilaian-f03?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, konfirmasiFilter]);

  const stats = {
    total: data.length,
    belum: data.filter((d) => d.statusPenilaian === "Belum Dinilai").length,
    sebagian: data.filter((d) => d.statusPenilaian === "Sebagian").length,
    lengkap: data.filter((d) => d.statusPenilaian === "Lengkap").length,
    dikonfirmasi: data.filter((d) => d.statusKonfirmasi === "Dikonfirmasi").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Monitoring Hasil Penilaian F03</h1>
        <p className="text-slate-500 mt-1">Pantau hasil penilaian F03 dari Penilai dan lakukan konfirmasi hasil sebelum pleno/finalisasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Total Plotting</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Belum Dinilai</p>
          <p className="text-2xl font-bold text-slate-400">{stats.belum}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Sebagian</p>
          <p className="text-2xl font-bold text-orange-500">{stats.sebagian}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-medium">Lengkap</p>
          <p className="text-2xl font-bold text-blue-600">{stats.lengkap}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-l-4 border-l-emerald-500">
          <p className="text-sm text-slate-500 font-medium">Dikonfirmasi</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.dikonfirmasi}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50">
          <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Cari mahasiswa atau NIM..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status Penilaian</option>
              <option value="Belum Dinilai">Belum Dinilai</option>
              <option value="Sebagian">Sebagian</option>
              <option value="Lengkap">Lengkap</option>
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={konfirmasiFilter}
              onChange={(e) => setKonfirmasiFilter(e.target.value)}
            >
              <option value="">Semua Status Konfirmasi</option>
              <option value="Belum Dikonfirmasi">Belum Dikonfirmasi</option>
              <option value="Dikonfirmasi">Dikonfirmasi</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Mahasiswa</th>
                <th className="px-6 py-4 font-semibold">Klaster</th>
                <th className="px-6 py-4 font-semibold">Penilai</th>
                <th className="px-6 py-4 font-semibold text-center">Progress</th>
                <th className="px-6 py-4 font-semibold text-center">Status Konfirmasi</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <span className="block text-2xl mb-2 text-blue-500">⏳</span>
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data hasil penilaian yang sesuai.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.mahasiswaNama}</div>
                      <div className="text-xs text-slate-500">{item.username}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.klasterName}</td>
                    <td className="px-6 py-4 text-slate-600">{item.penilaiNama}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs font-medium text-slate-600">
                          {item.totalSudahDinilai} / {item.totalMatkul} MK
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[80px]">
                          <div 
                            className={`h-1.5 rounded-full ${item.progressPenilaian === 100 ? "bg-emerald-500" : "bg-blue-500"}`} 
                            style={{ width: `${item.progressPenilaian}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.statusPenilaian === "Lengkap" ? "bg-emerald-100 text-emerald-700" :
                          item.statusPenilaian === "Sebagian" ? "bg-orange-100 text-orange-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {item.statusPenilaian}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {item.statusKonfirmasi === "Dikonfirmasi" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Dikonfirmasi
                            </span>
                          ) : item.statusKonfirmasi === "Dikembalikan" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                ⚠️ Dikembalikan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                🕒 Belum
                            </span>
                          )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/dashboard/admin/hasil-penilaian-f03/${item.plottingId}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        Detail & Konfirmasi
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
