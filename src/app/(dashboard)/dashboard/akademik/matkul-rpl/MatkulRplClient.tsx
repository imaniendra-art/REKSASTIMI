"use client";

import { useState } from "react";
import Link from "next/link";

type MatkulRpl = {
  id: string;
  kode: string;
  namaMatkul: string;
  sks: number;
  semester: number;
  cpmkCount: number;
};

export default function MatkulRplClient({ initialData }: { initialData: MatkulRpl[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState<number | null>(null);
  const accentColor = "#059669";

  const filtered = initialData.filter((m) => {
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
      <div className="md-card" style={{ marginBottom: 10, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 900, color: "#64748b" }}>C</span>
          <input
            type="text"
            placeholder="Cari kode atau nama matkul RPL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid var(--md-outline-variant)",
              borderRadius: 999,
              padding: "8px 12px 8px 32px",
              fontSize: 12,
              fontWeight: 750,
              color: "var(--md-on-surface)",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={() => setFilterSemester(null)} style={filterButtonStyle(filterSemester === null, accentColor)}>
            Semua
          </button>
          {semesters.map((s) => (
            <button key={s} onClick={() => setFilterSemester(s)} style={filterButtonStyle(filterSemester === s, accentColor)}>
              S{s}
            </button>
          ))}
        </div>
      </div>

      <div className="md-card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid var(--md-outline-variant)",
                }}
              >
                {["No", "SMT", "Kode", "Mata Kuliah", "SKS", "CPMK", "Aksi"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      fontSize: 9,
                      fontWeight: 900,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      textAlign: [0, 1, 4, 5, 6].includes(i) ? "center" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "30px 16px", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, margin: "0 auto 8px", borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>RPL</div>
                    <p style={{ fontSize: 12, color: "var(--md-on-surface)", fontWeight: 850, margin: "0 0 4px 0" }}>
                      {searchQuery || filterSemester ? "Mata kuliah RPL tidak ditemukan." : "Daftar RPL masih kosong."}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 650, margin: 0 }}>
                      Aktifkan status RPL melalui menu Master Kurikulum.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 900 }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 800, color: "#475569" }}>
                        {m.semester}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, color: accentColor, fontSize: 12 }}>
                        {m.kode}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ fontWeight: 850, fontSize: 12, color: "#1e293b", lineHeight: 1.35 }}>
                        {m.namaMatkul}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 650, marginTop: 1 }}>
                        Terbuka untuk jalur RPL
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 800, color: "#334155", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                        {m.sks}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {m.cpmkCount > 0 ? (
                        <span style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 850, display: "inline-flex", alignItems: "center" }}>
                          {m.cpmkCount} Item
                        </span>
                      ) : (
                        <span style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#94a3b8", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 750 }}>
                          Kosong
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <Link
                        href={`/dashboard/akademik/matkul/${m.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 58,
                          height: 28,
                          borderRadius: 999,
                          background: accentColor,
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 900,
                          textDecoration: "none",
                          boxShadow: "0 2px 8px rgba(5,150,105,0.22)",
                        }}
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>
          Menampilkan {filtered.length} dari {initialData.length} mata kuliah RPL
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>
          Total SKS tampil: {filtered.reduce((acc, m) => acc + m.sks, 0)}
        </span>
      </div>
    </div>
  );
}

function filterButtonStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    borderRadius: 999,
    border: active ? `1px solid ${accentColor}` : "1px solid var(--md-outline-variant)",
    background: active ? accentColor : "#fff",
    color: active ? "#fff" : "var(--md-on-surface-variant)",
    padding: "6px 10px",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  };
}
