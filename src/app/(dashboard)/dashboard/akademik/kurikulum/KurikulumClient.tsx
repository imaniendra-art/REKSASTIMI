"use client";

import { PageHero } from "@/components/dashboard/UIComponents";
import { useState, useCallback } from "react";
import { CustomInput } from "@/components/dashboard/CustomSelect";

type Matkul = {
  id: string;
  kode: string;
  namaMatkul: string;
  sks: number;
  semester: number;
  kelompok: string;
  konsentrasi: string;
  isRpl: boolean;
};

export default function KurikulumClient({
  initialData,
  initialRplCount,
}: {
  initialData: Matkul[];
  initialRplCount: number;
}) {
  const [matkulList, setMatkulList] = useState<Matkul[]>(initialData);
  const [rplCount, setRplCount] = useState(initialRplCount);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    kode: "",
    namaMatkul: "",
    sks: "3",
    semester: "1",
    kelompok: "",
    konsentrasi: "",
  });

  const showMsg = useCallback((type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  }, []);

  // Toggle RPL status
  async function toggleRpl(id: string) {
    try {
      const res = await fetch(`/api/akademik/matkul/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_rpl" }),
      });
      const data = await res.json();
      if (data.success) {
        setMatkulList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRpl: data.isRpl } : m))
        );
        setRplCount((prev) => (data.isRpl ? prev + 1 : prev - 1));
      } else {
        showMsg("error", data.message || "Gagal mengubah status RPL");
      }
    } catch {
      showMsg("error", "Koneksi gagal. Silakan coba lagi.");
    }
  }

  // Delete matkul
  async function deleteMatkul(id: string, nama: string) {
    if (
      !confirm(
        `Hapus matkul "${nama}"?\nSemua data terkait termasuk CPMK dan Klaster akan ikut dihapus.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/akademik/matkul/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const removed = matkulList.find((m) => m.id === id);
        setMatkulList((prev) => prev.filter((m) => m.id !== id));
        if (removed?.isRpl) setRplCount((prev) => prev - 1);
        showMsg("success", "Mata kuliah berhasil dihapus.");
      } else {
        showMsg("error", data.message || "Gagal menghapus.");
      }
    } catch {
      showMsg("error", "Koneksi gagal.");
    }
  }

  // Add matkul
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/akademik/matkul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: formData.kode,
          namaMatkul: formData.namaMatkul,
          sks: Number(formData.sks),
          semester: Number(formData.semester),
          kelompok: formData.kelompok,
          konsentrasi: formData.konsentrasi,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setMatkulList((prev) =>
          [...prev, data.data].sort((a, b) =>
            a.semester !== b.semester
              ? a.semester - b.semester
              : a.namaMatkul.localeCompare(b.namaMatkul)
          )
        );
        setRplCount((prev) => prev + 1);
        setFormData({ kode: "", namaMatkul: "", sks: "3", semester: "1", kelompok: "", konsentrasi: "" });
        setShowAddForm(false);
        showMsg("success", "Mata kuliah baru berhasil ditambahkan.");
      } else {
        showMsg("error", data.message || "Gagal menyimpan.");
      }
    } catch {
      showMsg("error", "Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  }

  // Filter
  const filtered = matkulList.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.namaMatkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSemester = filterSemester === null || m.semester === filterSemester;
    return matchSearch && matchSemester;
  });

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div>
      <PageHero
        badgeIcon="MK"
        badgeText="Data Akademik"
        title="Master Kurikulum"
        subtitle="Basis data seluruh mata kuliah prodi."
        tone="primary"
        rightContent={
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span style={heroChipStyle}>Total: {matkulList.length} Matkul</span>
            <span style={heroChipStyle}>RPL: {rplCount} Matkul</span>
            <button
              className="hero-action-button"
              onClick={() => setShowAddForm(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.boxShadow = "0 10px 22px rgba(15,23,42,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              style={{
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "10px 20px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
              }}
            >
              Tambah Matkul
            </button>
          </div>
        }
      />

      <div className="md-card" style={{ marginTop: 0, marginBottom: 10, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
          <CustomInput
            icon="C"
            label=""
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari kode atau nama matkul..."
            style={{ minHeight: 46, padding: "4px 12px" }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={() => setFilterSemester(null)} style={filterButtonStyle(filterSemester === null)}>
            Semua
          </button>
          {semesters.map((s) => (
            <button key={s} onClick={() => setFilterSemester(s)} style={filterButtonStyle(filterSemester === s)}>
              S{s}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800,
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1.5px solid ${message.type === "success" ? "#34d399" : "#f87171"}`,
            marginBottom: 10,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "none",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 200 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 }}>🔍</span>
            <input
              type="text"
              placeholder="Cari kode atau nama matkul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#fff",
                border: "1px solid var(--md-outline-variant)",
                borderRadius: 12,
                padding: "8px 12px 8px 34px",
                fontSize: 12,
                fontWeight: 750,
                outline: "none",
              }}
            />
          </div>
          {/* Semester filter */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button
              onClick={() => setFilterSemester(null)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: filterSemester === null ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                background: filterSemester === null ? "var(--md-primary)" : "#fff",
                color: filterSemester === null ? "#fff" : "#64748b",
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Semua
            </button>
            {semesters.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSemester(s)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: filterSemester === s ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
                  background: filterSemester === s ? "var(--md-primary)" : "#fff",
                  color: filterSemester === s ? "#fff" : "#64748b",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: 999,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Aktif RPL:
            </span>
            <span
              style={{
                background: "#dbeafe",
                color: "var(--md-primary)",
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {rplCount} Matkul
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: "linear-gradient(90deg, var(--md-primary), var(--md-secondary))",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "var(--md-shadow-1)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {showAddForm ? "Tutup" : "Tambah Matkul"}
          </button>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(15,23,42,0.48)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="md-card" style={{ width: "100%", maxWidth: 600, overflow: "hidden", background: "#fff", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", borderRadius: 20 }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Master Kurikulum</p>
                <h3 style={{ margin: "4px 0 0", fontWeight: 900, fontSize: 16, color: "#0284c7" }}>Input Mata Kuliah Baru</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} type="button" style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid #bae6fd", background: "#f0f9ff", color: "#0284c7", fontSize: 12, fontWeight: 900, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Tutup
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                  padding: 18,
                  background: "#f8fafc",
                }}
              >
              <div>
                <label style={labelStyle}>Kode Matkul *</label>
                <input
                  type="text"
                  required
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  placeholder="Contoh: MK001"
                  style={{ ...inputStyle, fontFamily: "monospace" }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Nama Mata Kuliah *</label>
                <input
                  type="text"
                  required
                  value={formData.namaMatkul}
                  onChange={(e) => setFormData({ ...formData, namaMatkul: e.target.value })}
                  placeholder="Masukkan nama mata kuliah"
                  style={{ ...inputStyle, textTransform: "uppercase" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Bobot SKS</label>
                <select
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="2">2 SKS</option>
                  <option value="3">3 SKS</option>
                  <option value="4">4 SKS</option>
                  <option value="6">6 SKS</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Kelompok (MKWN/MKK/dst)</label>
                <input
                  type="text"
                  value={formData.kelompok}
                  onChange={(e) => setFormData({ ...formData, kelompok: e.target.value })}
                  placeholder="Contoh: MKK"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Konsentrasi</label>
                <input
                  type="text"
                  value={formData.konsentrasi}
                  onChange={(e) => setFormData({ ...formData, konsentrasi: e.target.value })}
                  placeholder="Contoh: Manajemen Keuangan"
                  style={inputStyle}
                />
              </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", padding: "16px 24px", background: "#f8fafc" }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "2px solid #e2e8f0",
                  background: "#fff",
                  color: "#64748b",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                BATAL
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: "#0ea5e9",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "MENYIMPAN..." : "SIMPAN MATKUL"}
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="md-card"
        style={{ overflow: "hidden", padding: 0 }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid var(--md-outline-variant)",
                }}
              >
                {["No", "SMT", "Kode", "Nama Mata Kuliah", "SKS", "Kelompok", "Status RPL", "Aksi"].map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "9px 12px",
                        fontSize: 9,
                        fontWeight: 900,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        textAlign: [0, 1, 4, 6, 7].includes(i) ? "center" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "30px 16px", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, margin: "0 auto 8px", borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>MK</div>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                      {searchQuery || filterSemester
                        ? "Tidak ditemukan mata kuliah yang sesuai filter."
                        : "Belum ada data mata kuliah."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((m, index) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* No */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 900 }}>
                        {index + 1}
                      </span>
                    </td>
                    {/* Semester */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#475569",
                        }}
                      >
                        {m.semester}
                      </span>
                    </td>
                    {/* Kode */}
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "var(--md-primary)",
                          fontSize: 12,
                        }}
                      >
                        {m.kode}
                      </span>
                    </td>
                    {/* Nama */}
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ fontWeight: 850, fontSize: 12, color: "#1e293b", lineHeight: 1.35 }}>
                        {m.namaMatkul}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>
                        {m.konsentrasi || "Prodi Reguler"}
                      </div>
                    </td>
                    {/* SKS */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          background: "#fff",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#334155",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        {m.sks}
                      </span>
                    </td>
                    {/* Kelompok */}
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
                        {m.kelompok}
                      </span>
                    </td>
                    {/* Toggle RPL */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <label
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: 42,
                          height: 22,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={m.isRpl}
                          onChange={() => toggleRpl(m.id)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 999,
                            background: m.isRpl
                              ? "linear-gradient(90deg, var(--md-primary), var(--md-secondary))"
                              : "#cbd5e1",
                            transition: "background 300ms",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#fff",
                              top: 3,
                              left: m.isRpl ? 23 : 3,
                              transition: "left 300ms",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                        </span>
                      </label>
                    </td>
                    {/* Aksi */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <button
                          onClick={() => deleteMatkul(m.id, m.namaMatkul)}
                          title="Hapus"
                          style={{
                            minWidth: 54,
                            height: 28,
                            borderRadius: 999,
                            border: "1px solid #fecdd3",
                            background: "#fff",
                            color: "#e11d48",
                            fontSize: 10,
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fff1f2";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 4px",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>
          Menampilkan {filtered.length} dari {matkulList.length} mata kuliah
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>
          Total SKS Aktif RPL: {matkulList.filter((m) => m.isRpl).reduce((acc, m) => acc + m.sks, 0)}
        </span>
      </div>
    </div>
  );
}

// Styles
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 9,
  fontWeight: 800,
  color: "#94a3b8",
  marginBottom: 3,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const heroChipStyle: React.CSSProperties = {
  borderRadius: 999,
  background: "rgba(255,255,255,0.18)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.28)",
  padding: "7px 11px",
  fontSize: 10,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

function heroSemesterButtonStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 999,
    border: active ? "1px solid #fff" : "1px solid rgba(255,255,255,0.28)",
    background: active ? "#fff" : "rgba(255,255,255,0.14)",
    color: active ? "var(--md-primary)" : "#fff",
    padding: "5px 10px",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  };
}

function filterButtonStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 999,
    border: active ? "1px solid var(--md-primary)" : "1px solid var(--md-outline-variant)",
    background: active ? "var(--md-primary)" : "#fff",
    color: active ? "#fff" : "var(--md-on-surface-variant)",
    padding: "6px 10px",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--md-surface-2)",
  border: "1px solid var(--md-outline-variant)",
  borderRadius: 10,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  color: "#1e293b",
  outline: "none",
};
