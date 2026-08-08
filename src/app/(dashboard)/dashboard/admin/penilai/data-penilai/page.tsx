"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PenilaiData = {
  _id: string;
  username: string;
  name: string;
  email: string;
  status: string;
  profile: any;
  klasters: any[];
};

type KlasterData = {
  _id: string;
  namaKlaster: string;
  kodeKlaster: string;
};

export default function ManajemenPenilaiPage() {
  const router = useRouter();
  const [penilaiList, setPenilaiList] = useState<PenilaiData[]>([]);
  const [klasterList, setKlasterList] = useState<KlasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<PenilaiData | null>(null);
  const [showMappingModal, setShowMappingModal] = useState<PenilaiData | null>(null);
  const [activeTab, setActiveTab] = useState("dasar");

  useEffect(() => {
    fetchData();
    fetchKlasters();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/penilai");
      if (!res.ok) throw new Error("Gagal mengambil data penilai");
      const json = await res.json();
      setPenilaiList(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKlasters = async () => {
    try {
      // Assuming GET /api/akademik/klaster exists or similar
      const res = await fetch("/api/akademik/klaster");
      if (res.ok) {
        const json = await res.json();
        setKlasterList(json || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
    fetchData();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
    if (!confirm(`Yakin ingin meng${newStatus}kan penilai ini?`)) return;

    try {
      const res = await fetch(`/api/admin/penilai/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      showSuccess(`Status penilai berhasil diubah menjadi ${newStatus}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/admin/penilai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menambah penilai");
      
      setShowAddModal(false);
      showSuccess("Penilai berhasil ditambahkan");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/admin/penilai/${showEditModal._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengupdate profil penilai");
      
      setShowEditModal(null);
      showSuccess("Profil penilai berhasil diupdate");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMappingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showMappingModal) return;
    
    const formData = new FormData(e.currentTarget);
    const klasterIds = formData.getAll("klasterIds");

    try {
      const res = await fetch(`/api/admin/penilai/${showMappingModal._id}/mapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ klasterIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal update mapping");
      
      setShowMappingModal(null);
      showSuccess("Mapping klaster berhasil diperbarui");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Styles
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 };
  const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
  const modalContentStyle: React.CSSProperties = { width: "100%", maxWidth: 600, background: "#fff", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" };
  const btnStyle = { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" };

  return (
    <div style={{ width: "100%" }}>
      <PageHero
        badgeText="Manajemen Penilai"
        title="Daftar Penilai RPL"
        subtitle="Kelola data penilai dan mapping keahlian klaster yang akan ditugaskan ke asesi."
        tone="danger"
        rightContent={
          <button 
            className="hero-action-button" 
            style={{ background: "var(--md-primary)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}
            onClick={() => setShowAddModal(true)}
          >
            + Tambah Penilai
          </button>
        }
      />

      {message && (
        <div style={{ padding: 16, background: "#d1fae5", color: "#065f46", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "#fee2e2", color: "#991b1b", borderRadius: 12, marginBottom: 20, fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div className="md-card" style={{ padding: 24, overflowX: "auto" }}>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "#64748b" }}>
                <th style={{ padding: 16 }}>Penilai</th>
                <th style={{ padding: 16 }}>NIDN / Instansi</th>
                <th style={{ padding: 16 }}>Jenis Penilai</th>
                <th style={{ padding: 16 }}>Klaster Keahlian</th>
                <th style={{ padding: 16 }}>Status</th>
                <th style={{ padding: 16, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penilaiList.map(item => (
                <tr key={item._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.username}</div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{item.profile?.nidn || "-"}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.profile?.instansi || "-"}</div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ padding: "4px 8px", background: "#f1f5f9", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {item.profile?.jenisPenilai || "Belum diset"}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {item.klasters.length > 0 ? (
                        item.klasters.map((k: any) => (
                          <span key={k.klasterId} style={{ padding: "4px 8px", background: "#dbeafe", color: "#1e40af", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {k.namaKlaster}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Belum ada mapping</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: item.status === "aktif" ? "#dcfce7" : "#fee2e2", 
                      color: item.status === "aktif" ? "#166534" : "#991b1b",
                      borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase" 
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => setShowMappingModal(item)}
                        style={{ ...btnStyle, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}
                      >
                        Mapping
                      </button>
                      <button 
                        onClick={() => { setShowEditModal(item); setActiveTab("dasar"); }}
                        style={{ ...btnStyle, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        style={{ ...btnStyle, background: item.status === "aktif" ? "#fef2f2" : "#f0fdf4", color: item.status === "aktif" ? "#991b1b" : "#166534", border: `1px solid ${item.status === "aktif" ? "#fecaca" : "#bbf7d0"}` }}
                      >
                        {item.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {penilaiList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                    Belum ada data penilai
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#0f172a" }}>Tambah Penilai Baru</h3>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input name="namaLengkap" placeholder="Nama Lengkap" required style={inputStyle} />
                <input name="username" placeholder="Username (Login)" required style={inputStyle} />
                <input name="password" type="password" placeholder="Password Login" required style={inputStyle} />
                <input name="email" type="email" placeholder="Email (Opsional)" style={inputStyle} />
                <input name="nidn" placeholder="NIDN / NIK" style={inputStyle} />
                <input name="noHp" placeholder="No HP" style={inputStyle} />
                <select name="jenisPenilai" required style={inputStyle}>
                  <option value="">-- Pilih Jenis Penilai --</option>
                  <option value="Akademisi">Akademisi</option>
                  <option value="Praktisi">Praktisi</option>
                  <option value="Internal">Internal</option>
                  <option value="Eksternal">Eksternal</option>
                </select>
                <input name="instansi" placeholder="Instansi" style={inputStyle} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Batal</button>
                <button type="submit" style={{ ...btnStyle, background: "var(--md-primary)", color: "#fff" }}>Simpan Penilai</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: 800 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#0f172a" }}>Edit Profil Penilai</h3>
            
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
              <button 
                type="button"
                onClick={() => setActiveTab("dasar")}
                style={{ ...btnStyle, background: activeTab === "dasar" ? "var(--md-primary)" : "transparent", color: activeTab === "dasar" ? "#fff" : "#64748b" }}
              >
                Informasi Dasar
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("biodata")}
                style={{ ...btnStyle, background: activeTab === "biodata" ? "var(--md-primary)" : "transparent", color: activeTab === "biodata" ? "#fff" : "#64748b" }}
              >
                Biodata (F04/F05)
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("riwayat")}
                style={{ ...btnStyle, background: activeTab === "riwayat" ? "var(--md-primary)" : "transparent", color: activeTab === "riwayat" ? "#fff" : "#64748b" }}
              >
                Riwayat & Asosiasi
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeTab === "dasar" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Nama Lengkap</label><input name="namaLengkap" defaultValue={showEditModal.name} required style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Email</label><input name="email" type="email" defaultValue={showEditModal.email} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>NIDN / NIK</label><input name="nidn" defaultValue={showEditModal.profile?.nidn} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>No HP</label><input name="noHp" defaultValue={showEditModal.profile?.noHp} style={inputStyle} /></div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Jenis Penilai</label>
                    <select name="jenisPenilai" defaultValue={showEditModal.profile?.jenisPenilai} required style={inputStyle}>
                      <option value="">-- Pilih Jenis Penilai --</option>
                      <option value="Akademisi">Akademisi</option>
                      <option value="Praktisi">Praktisi</option>
                      <option value="Internal">Internal</option>
                      <option value="Eksternal">Eksternal</option>
                    </select>
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Instansi</label><input name="instansi" defaultValue={showEditModal.profile?.instansi} style={inputStyle} /></div>
                </div>
              )}

              {activeTab === "biodata" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Jenis Kelamin</label>
                    <select name="jenisKelamin" defaultValue={showEditModal.profile?.jenisKelamin} style={inputStyle}>
                      <option value="">-- Pilih --</option>
                      <option value="Pria">Pria</option>
                      <option value="Wanita">Wanita</option>
                    </select>
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Tempat Lahir</label><input name="tempatLahir" defaultValue={showEditModal.profile?.tempatLahir} style={inputStyle} /></div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Tanggal Lahir</label>
                    <input type="date" name="tanggalLahir" defaultValue={showEditModal.profile?.tanggalLahir ? showEditModal.profile.tanggalLahir.split("T")[0] : ""} style={inputStyle} />
                  </div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>NIK</label><input name="nik" defaultValue={showEditModal.profile?.nik} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Pendidikan Terakhir</label><input name="pendidikanTerakhir" defaultValue={showEditModal.profile?.pendidikanTerakhir} placeholder="Mis: S3 Manajemen" style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Prodi Keilmuan</label><input name="prodiKeilmuan" defaultValue={showEditModal.profile?.prodiKeilmuan} style={inputStyle} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Alamat Rumah</label><textarea name="alamatRumah" defaultValue={showEditModal.profile?.alamatRumah} style={inputStyle} rows={2} /></div>
                  
                  {/* Keep fields hidden if not active tab to submit all data */}
                </div>
              )}

              {activeTab === "riwayat" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: "#0f172a" }}>Asosiasi Profesi & Keahlian</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Bidang Keahlian Kerja (Spesifik)</label><input name="bidangKeahlianKerja" defaultValue={showEditModal.profile?.bidangKeahlianKerja} style={inputStyle} /></div>
                      <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Nama Asosiasi</label><input name="namaAsosiasi" defaultValue={showEditModal.profile?.namaAsosiasi} style={inputStyle} /></div>
                      <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>No Anggota</label><input name="noAnggotaAsosiasi" defaultValue={showEditModal.profile?.noAnggotaAsosiasi} style={inputStyle} /></div>
                      <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Jabatan di Asosiasi</label><input name="jabatanAsosiasi" defaultValue={showEditModal.profile?.jabatanAsosiasi} style={inputStyle} /></div>
                      <div><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Telp / Fax Asosiasi</label><input name="telpFaxAsosiasi" defaultValue={showEditModal.profile?.telpFaxAsosiasi} style={inputStyle} /></div>
                      <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Alamat Asosiasi</label><input name="alamatAsosiasi" defaultValue={showEditModal.profile?.alamatAsosiasi} style={inputStyle} /></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", padding: "0 16px" }}>
                    *Untuk kelengkapan Riwayat Pendidikan (S1-S3), Pengalaman Mengajar, Pekerjaan Praktisi, dan Upload TTD, penilai dapat melengkapinya secara mandiri melalui menu <strong>Biodata Profil</strong> di Dashboard Penilai.
                  </div>
                </div>
              )}

              {/* Hidden fields for unrendered tabs so FormData captures them */}
              <div style={{ display: "none" }}>
                {activeTab !== "dasar" && (
                  <>
                    <input name="namaLengkap" defaultValue={showEditModal.name} />
                    <input name="email" defaultValue={showEditModal.email} />
                    <input name="nidn" defaultValue={showEditModal.profile?.nidn} />
                    <input name="noHp" defaultValue={showEditModal.profile?.noHp} />
                    <input name="jenisPenilai" defaultValue={showEditModal.profile?.jenisPenilai} />
                    <input name="instansi" defaultValue={showEditModal.profile?.instansi} />
                  </>
                )}
                {activeTab !== "biodata" && (
                  <>
                    <input name="jenisKelamin" defaultValue={showEditModal.profile?.jenisKelamin} />
                    <input name="tempatLahir" defaultValue={showEditModal.profile?.tempatLahir} />
                    <input name="tanggalLahir" defaultValue={showEditModal.profile?.tanggalLahir ? showEditModal.profile.tanggalLahir.split("T")[0] : ""} />
                    <input name="nik" defaultValue={showEditModal.profile?.nik} />
                    <input name="pendidikanTerakhir" defaultValue={showEditModal.profile?.pendidikanTerakhir} />
                    <input name="prodiKeilmuan" defaultValue={showEditModal.profile?.prodiKeilmuan} />
                    <textarea name="alamatRumah" defaultValue={showEditModal.profile?.alamatRumah} />
                  </>
                )}
                {activeTab !== "riwayat" && (
                  <>
                    <input name="bidangKeahlianKerja" defaultValue={showEditModal.profile?.bidangKeahlianKerja} />
                    <input name="namaAsosiasi" defaultValue={showEditModal.profile?.namaAsosiasi} />
                    <input name="noAnggotaAsosiasi" defaultValue={showEditModal.profile?.noAnggotaAsosiasi} />
                    <input name="jabatanAsosiasi" defaultValue={showEditModal.profile?.jabatanAsosiasi} />
                    <input name="telpFaxAsosiasi" defaultValue={showEditModal.profile?.telpFaxAsosiasi} />
                    <input name="alamatAsosiasi" defaultValue={showEditModal.profile?.alamatAsosiasi} />
                  </>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowEditModal(null)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Batal</button>
                <button type="submit" style={{ ...btnStyle, background: "var(--md-primary)", color: "#fff" }}>Update Profil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MAPPING */}
      {showMappingModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#0f172a" }}>Mapping Keahlian Klaster</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Pilih klaster yang relevan dengan keahlian <strong>{showMappingModal.name}</strong>.
            </p>
            <form onSubmit={handleMappingSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                {klasterList.length > 0 ? klasterList.map(k => {
                  const isChecked = showMappingModal.klasters.some((mk: any) => mk.klasterId === (k as any).id);
                  return (
                    <label key={(k as any).id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}>
                      <input 
                        type="checkbox" 
                        name="klasterIds" 
                        value={(k as any).id} 
                        defaultChecked={isChecked}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{(k as any).nama}</span>
                    </label>
                  );
                }) : (
                  <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Gagal memuat klaster atau klaster kosong.</p>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowMappingModal(null)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Batal</button>
                <button type="submit" style={{ ...btnStyle, background: "var(--md-primary)", color: "#fff" }}>Simpan Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
