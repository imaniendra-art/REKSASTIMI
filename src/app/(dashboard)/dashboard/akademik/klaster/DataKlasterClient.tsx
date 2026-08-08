"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Klaster = {
  id: string;
  nama: string;
  jmlMatkul: number;
  totalSks: number;
};

import { PageHero } from "@/components/dashboard/UIComponents";

export default function DataKlasterClient({ initialData }: { initialData: Klaster[] }) {
  const router = useRouter();
  const [data, setData] = useState<Klaster[]>(initialData);

  // Modals state
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form state
  const [namaKlaster, setNamaKlaster] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Action: Tambah
  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKlaster.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/akademik/klaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaKlaster }),
      });
      if (res.ok) {
        setNamaKlaster("");
        setIsTambahOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menambah klaster");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsSaving(false);
  };

  // Action: Edit
  const openEdit = (id: string, nama: string) => {
    setEditId(id);
    setNamaKlaster(nama);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !namaKlaster.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/akademik/klaster/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaKlaster }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengedit klaster");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsSaving(false);
  };

  // Action: Delete
  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus klaster "${nama}"?\n\nSemua mata kuliah di dalamnya akan dilepas dari klaster ini.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/akademik/klaster/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData(prev => prev.filter(k => k.id !== id));
        router.refresh();
      } else {
        alert("Gagal menghapus klaster");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  return (
    <div>
      <PageHero
        badgeIcon="KLST"
        badgeText="Data Akademik"
        title="Klaster Rumpun Ilmu"
        subtitle="Pengelompokan Matkul Untuk Pemetaan Kompetensi"
        tone="info"
        rightContent={
          <button
            onClick={() => {
              setNamaKlaster("");
              setIsTambahOpen(true);
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 999,
              padding: "10px 20px",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "transform 0.2s, background 0.2s",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            Tambah Klaster
          </button>
        }
      />

      {/* Table */}
      <div className="md-card" style={{ overflow: "hidden", padding: 0, marginTop: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--md-outline-variant)" }}>
                {["No", "Nama Klaster / Rumpun", "Jumlah Matkul", "Total SKS", "Aksi"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      fontSize: 9,
                      fontWeight: 900,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      textAlign: [0, 2, 3, 4].includes(i) ? "center" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "30px 16px", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, margin: "0 auto 8px", borderRadius: 14, background: "var(--md-primary-container)", color: "var(--md-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>KLST</div>
                    <p style={{ fontSize: 12, color: "var(--md-on-surface)", fontWeight: 850, margin: "0 0 4px 0" }}>Belum Ada Klaster</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 650, margin: 0 }}>Kelompokkan mata kuliah ke dalam rumpun ilmu untuk mempermudah asesmen.</p>
                  </td>
                </tr>
              ) : (
                data.map((k, idx) => (
                  <tr
                    key={k.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ color: "var(--md-on-surface-variant)", fontSize: 11, fontWeight: 900 }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ fontWeight: 850, fontSize: 12, color: "#1e293b", lineHeight: 1.35 }}>{k.nama}</div>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 850, display: "inline-flex", alignItems: "center" }}>
                        {k.jmlMatkul} Matkul
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 800, color: "#16a34a", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                        {k.totalSks} SKS
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <Link
                          href={`/dashboard/akademik/klaster/${k.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 48,
                            height: 28,
                            borderRadius: 999,
                            background: "#0ea5e9",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 900,
                            textDecoration: "none",
                            boxShadow: "0 2px 8px rgba(14,165,233,0.22)",
                          }}
                        >
                          Atur
                        </Link>
                        <button
                          onClick={() => openEdit(k.id, k.nama)}
                          style={{
                            minWidth: 48,
                            height: 28,
                            borderRadius: 999,
                            border: "1px solid #bae6fd",
                            background: "#e0f2fe",
                            color: "#0284c7",
                            fontSize: 10,
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(k.id, k.nama)}
                          style={{
                            minWidth: 48,
                            height: 28,
                            borderRadius: 999,
                            border: "1px solid #fecdd3",
                            background: "#fff",
                            color: "#e11d48",
                            fontSize: 10,
                            fontWeight: 900,
                            cursor: "pointer",
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

      {/* Modal Tambah */}
      {isTambahOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 450, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
              <h5 style={{ margin: 0, fontWeight: 900, fontSize: 16, color: "#0284c7" }}>Tambah Klaster Baru</h5>
              <button onClick={() => setIsTambahOpen(false)} style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid #bae6fd", background: "#f0f9ff", color: "#0284c7", fontSize: 12, fontWeight: 900, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tutup</button>
            </div>
            <form onSubmit={handleTambah}>
              <div style={{ padding: "24px" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8, letterSpacing: "1px" }}>
                  Nama Klaster / Rumpun Ilmu
                </label>
                <input
                  type="text"
                  value={namaKlaster}
                  onChange={(e) => setNamaKlaster(e.target.value)}
                  placeholder="Misal: Manajemen & Bisnis"
                  required
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 999, border: "none", background: "#f1f5f9", fontSize: 14, fontWeight: 800, color: "#1e293b", outline: "none" }}
                />
              </div>
              <div style={{ padding: "16px 24px", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsTambahOpen(false)} style={{ padding: "10px 20px", borderRadius: 999, border: "2px solid #e2e8f0", background: "#fff", fontWeight: 800, color: "#64748b", fontSize: 12, cursor: "pointer" }}>BATAL</button>
                <button type="submit" disabled={isSaving} style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: isSaving ? "#94a3b8" : "#0ea5e9", fontWeight: 800, color: "#fff", fontSize: 12, cursor: isSaving ? "not-allowed" : "pointer" }}>
                  {isSaving ? "MENYIMPAN..." : "SIMPAN KLASTER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {isEditOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 450, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
              <h5 style={{ margin: 0, fontWeight: 900, fontSize: 16, color: "#0284c7" }}>✏️ Edit Nama Klaster</h5>
              <button onClick={() => setIsEditOpen(false)} style={{ minWidth: 72, height: 34, borderRadius: 999, border: "1px solid #bae6fd", background: "#f0f9ff", color: "#0284c7", fontSize: 12, fontWeight: 900, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tutup</button>
            </div>
            <form onSubmit={handleEdit}>
              <div style={{ padding: "24px" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8, letterSpacing: "1px" }}>
                  Nama Klaster / Rumpun Ilmu
                </label>
                <input
                  type="text"
                  value={namaKlaster}
                  onChange={(e) => setNamaKlaster(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 999, border: "none", background: "#f1f5f9", fontSize: 14, fontWeight: 800, color: "#1e293b", outline: "none" }}
                />
              </div>
              <div style={{ padding: "16px 24px", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: "10px 20px", borderRadius: 999, border: "2px solid #e2e8f0", background: "#fff", fontWeight: 800, color: "#64748b", fontSize: 12, cursor: "pointer" }}>BATAL</button>
                <button type="submit" disabled={isSaving} style={{ padding: "10px 24px", borderRadius: 999, border: "none", background: isSaving ? "#94a3b8" : "#0ea5e9", fontWeight: 800, color: "#fff", fontSize: 12, cursor: isSaving ? "not-allowed" : "pointer" }}>
                  {isSaving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
