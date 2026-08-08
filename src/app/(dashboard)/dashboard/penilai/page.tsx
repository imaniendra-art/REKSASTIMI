"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { CustomSelect, CustomInput } from "@/components/dashboard/CustomSelect";

type DashboardData = {
  plottingId: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  username: string;
  klasterId: string;
  klasterName: string;
  statusPlotting: string;
  f03Status: string;
  evaluationProgress: string;
  totalMatkul: number;
  totalSudahDinilai: number;
  totalBelumDinilai: number;
  assignedAt: string;
  certificateNumber: string | null;
};

export default function PenilaiDashboardPage() {
  const [dataList, setDataList] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePeriod, setActivePeriod] = useState("");

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [filterStatus, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "Semua") params.append("status", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/penilai/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data penugasan");
      const json = await res.json();
      setDataList(json.data || []);
      setActivePeriod(json.activePeriod || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPenugasan = dataList.length;
  const menunggu = dataList.filter(d => d.evaluationProgress === "Menunggu Penilaian").length;
  const selesai = dataList.filter(d => d.evaluationProgress === "Selesai Dinilai").length;

  const inputStyle = { padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Dashboard Penilai"
        title="Daftar Penugasan F03"
        subtitle="Daftar mahasiswa yang ditugaskan kepada Anda untuk dinilai portofolio F03-nya."
        tone="primary"
        rightContent={
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ 
              background: "rgba(255,255,255,0.18)", 
              color: "#fff", 
              border: "1px solid rgba(255,255,255,0.28)", 
              padding: "8px 14px", 
              borderRadius: 999, 
              fontSize: 12, 
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span>📅</span> {activePeriod || "Loading..."}
            </div>
            <Link 
              href="/dashboard/penilai/biodata"
              style={{ 
                background: "#fff", 
                color: "var(--md-primary)", 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: 999, 
                fontSize: 12, 
                fontWeight: 900, 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            >
              <span>👤</span> Profil Diri
            </Link>
          </div>
        }
      />

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="md-card" style={{ padding: 20, borderLeft: "4px solid var(--md-primary)" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Penugasan</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{totalPenugasan}</div>
        </div>
        <div className="md-card" style={{ padding: 20, borderLeft: "4px solid #eab308" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Menunggu Penilaian</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{menunggu}</div>
        </div>
        <div className="md-card" style={{ padding: 20, borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Selesai Dinilai</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8 }}>{selesai}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="md-card animate-fade-up" style={{ padding: 12, marginBottom: 20, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", alignItems: "stretch" }}>
        
        <CustomSelect
          icon="S"
          label="Status F03"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "Semua", label: "Semua Status Penilaian" },
            { value: "Menunggu Penilaian", label: "Menunggu Penilaian" },
            { value: "Sebagian Dinilai", label: "Sebagian Dinilai" },
            { value: "Selesai Dinilai", label: "Selesai Dinilai" }
          ]}
        />

        <CustomInput
          icon="C"
          label="Pencarian"
          value={search}
          onChange={setSearch}
          placeholder="Nama mahasiswa atau username..."
        />

      </div>

      <div className="md-card" style={{ padding: 24, overflowX: "auto" }}>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "#64748b" }}>
                <th style={{ padding: 16 }}>Mahasiswa</th>
                <th style={{ padding: 16 }}>Klaster</th>
                <th style={{ padding: 16 }}>Status F03</th>
                <th style={{ padding: 16 }}>Progress Penilaian</th>
                <th style={{ padding: 16 }}>Tgl Plotting</th>
                <th style={{ padding: 16, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map(item => (
                <tr key={item.plottingId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.mahasiswaNama}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.username}</div>
                  </td>
                  <td style={{ padding: 16, fontWeight: 700, color: "#334155" }}>
                    {item.klasterName}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: item.f03Status === "Lengkap" ? "#dcfce7" : item.f03Status === "Sebagian" ? "#fef08a" : "#f1f5f9", 
                      color: item.f03Status === "Lengkap" ? "#166534" : item.f03Status === "Sebagian" ? "#854d0e" : "#475569", 
                      borderRadius: 6, fontSize: 11, fontWeight: 700 
                    }}>
                      {item.f03Status}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        background: item.evaluationProgress === "Selesai Dinilai" ? "#dcfce7" : item.evaluationProgress === "Sebagian Dinilai" ? "#fef08a" : "#fee2e2", 
                        color: item.evaluationProgress === "Selesai Dinilai" ? "#166534" : item.evaluationProgress === "Sebagian Dinilai" ? "#854d0e" : "#991b1b",
                        borderRadius: 6, fontSize: 11, fontWeight: 700 
                      }}>
                        {item.evaluationProgress}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                        ({item.totalSudahDinilai}/{item.totalMatkul})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 16, fontSize: 13, color: "#475569" }}>
                    {new Date(item.assignedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <Link 
                      href={`/dashboard/penilai/f03/${item.plottingId}`}
                      style={{ 
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, 
                        background: "var(--md-primary)", color: "#fff", textDecoration: "none", display: "inline-block"
                      }}
                    >
                      Nilai F03
                    </Link>
                  </td>
                </tr>
              ))}
              {dataList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                    Belum ada tugas plotting untuk Anda saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
