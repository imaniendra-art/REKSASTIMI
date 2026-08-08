"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { CustomSelect, CustomInput } from "@/components/dashboard/CustomSelect";

type FinalisasiData = {
  _id: string;
  mahasiswa: { _id: string; name: string; username: string };
  periodId: string;
  totalSksDiakui: number;
  mahasiswaDecisionStatus: string;
  statusFinalisasi: string;
  plenoStatus: string;
  statusSanggahan: string | null;
  canFinalize: boolean;
};

export default function FinalisasiRplListPage() {
  const [dataList, setDataList] = useState<FinalisasiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [filterStatus, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "Semua") params.append("mahasiswaDecisionStatus", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/finalisasi-rpl?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDataList(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    const mahasiswaId = prompt("Masukkan ID User Mahasiswa untuk di-generate draftnya (contoh MVP):");
    if (!mahasiswaId) return;

    try {
      const res = await fetch(`/api/admin/finalisasi-rpl/${mahasiswaId}/generate-draft`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessage("Draf berhasil dibuat");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleGenerateBa = async () => {
    try {
      const activePeriodReq = await fetch("/api/admin/periode");
      const pJson = await activePeriodReq.json();
      const activePeriod = pJson.data?.find((p: any) => p.isActive);
      if (!activePeriod) return alert("Tidak ada periode aktif");

      const res = await fetch(`/api/admin/finalisasi-rpl/generate-ba-pleno`, { 
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: activePeriod._id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessage(json.message);
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const handleGenerateSk = async () => {
    try {
      const activePeriodReq = await fetch("/api/admin/periode");
      const pJson = await activePeriodReq.json();
      const activePeriod = pJson.data?.find((p: any) => p.isActive);
      if (!activePeriod) return alert("Tidak ada periode aktif");

      const res = await fetch(`/api/admin/finalisasi-rpl/generate-sk-hasil`, { 
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: activePeriod._id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessage(json.message);
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  const btnStyle = { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Finalisasi"
        title="Finalisasi Hasil RPL"
        subtitle="Manajemen draf konversi nilai, penanganan sanggahan, hingga pengesahan BA Pleno & SK Hasil RPL."
        tone="primary"
      />

      {message && (
        <div style={{ padding: 16, background: "#dcfce7", color: "#166534", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={handleGenerateDraft} style={{ ...btnStyle, background: "#f1f5f9", color: "#334155" }}>
          + Generate Draft Manual
        </button>
        <button onClick={handleGenerateBa} style={{ ...btnStyle, background: "#dbeafe", color: "#1e40af" }}>
          📄 Generate BA Pleno (DRAFT)
        </button>
        <button onClick={handleGenerateSk} style={{ ...btnStyle, background: "#dbeafe", color: "#1e40af" }}>
          📜 Generate SK Hasil (DRAFT)
        </button>
      </div>

      <div className="md-card animate-fade-up" style={{ padding: 12, marginBottom: 20, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
        <CustomSelect
          icon="S"
          label="Respon Mahasiswa"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "Semua", label: "Semua Status" },
            { value: "BELUM_DIKIRIM", label: "Belum Dikirim" },
            { value: "MENUNGGU_RESPON", label: "Menunggu Respon" },
            { value: "DISANGGAH", label: "Disanggah" },
            { value: "DITERIMA", label: "Diterima" }
          ]}
        />
        <CustomInput
          icon="C"
          label="Pencarian"
          value={search}
          onChange={setSearch}
          placeholder="Cari mahasiswa..."
        />
      </div>

      <div className="md-card" style={{ padding: 24, overflowX: "auto" }}>
        {loading ? <p>Memuat data...</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "#64748b" }}>
                <th style={{ padding: 16 }}>Mahasiswa</th>
                <th style={{ padding: 16 }}>SKS Diakui</th>
                <th style={{ padding: 16 }}>Respon Mahasiswa</th>
                <th style={{ padding: 16 }}>Status Finalisasi</th>
                <th style={{ padding: 16 }}>Pleno</th>
                <th style={{ padding: 16, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map(item => (
                <tr key={item._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800 }}>{item.mahasiswa.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.mahasiswa.username}</div>
                  </td>
                  <td style={{ padding: 16, fontWeight: 700 }}>{item.totalSksDiakui} SKS</td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: item.mahasiswaDecisionStatus === "DITERIMA" ? "#dcfce7" : 
                                  item.mahasiswaDecisionStatus === "DISANGGAH" ? "#fee2e2" : "#f1f5f9",
                      color: item.mahasiswaDecisionStatus === "DITERIMA" ? "#166534" : 
                             item.mahasiswaDecisionStatus === "DISANGGAH" ? "#991b1b" : "#475569"
                    }}>
                      {item.mahasiswaDecisionStatus}
                    </span>
                    {item.statusSanggahan === "SUBMITTED" && (
                      <div style={{ fontSize: 10, color: "#dc2626", marginTop: 4, fontWeight: 700 }}>Ada Sanggahan!</div>
                    )}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: item.statusFinalisasi === "FINAL" ? "#dbeafe" : "#fef08a", color: item.statusFinalisasi === "FINAL" ? "#1e40af" : "#854d0e" }}>
                      {item.statusFinalisasi}
                    </span>
                  </td>
                  <td style={{ padding: 16, fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    {item.plenoStatus.replace("_", " ")}
                  </td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <Link href={`/dashboard/admin/finalisasi-rpl/${item._id}`} style={{ ...btnStyle, background: "var(--md-primary)", color: "#fff", textDecoration: "none" }}>
                      Detail & Aksi
                    </Link>
                  </td>
                </tr>
              ))}
              {dataList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Tidak ada draf finalisasi.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
