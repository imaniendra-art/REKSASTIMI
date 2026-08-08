"use client";

import { useState, useEffect } from "react";

export function SkLampiranManager({ sk, isFinal, onRefresh }: { sk: any, isFinal: boolean, onRefresh: () => void }) {
  if (!sk) return null;

  if (sk.skType === "SK_PEDOMAN_INSTITUSI" || sk.skType === "SK_PEDOMAN_PRODI") {
    return <LampiranPedoman sk={sk} isFinal={isFinal} onRefresh={onRefresh} />;
  }

  if (sk.skType === "SK_PENGELOLA_RPL") {
    return <LampiranTimPengelola sk={sk} isFinal={isFinal} onRefresh={onRefresh} />;
  }

  if (sk.skType === "SK_PENILAI_RPL") {
    return <LampiranPenilai sk={sk} isFinal={isFinal} onRefresh={onRefresh} />;
  }

  if (sk.skType === "SK_PENUGASAN_PENILAI") {
    return <LampiranPenugasan sk={sk} />;
  }

  return (
    <div style={{ fontSize: 13, color: "#64748b" }}>
      Tidak ada manajemen lampiran khusus untuk tipe SK ini.
    </div>
  );
}

function LampiranPedoman({ sk, isFinal, onRefresh }: { sk: any, isFinal: boolean, onRefresh: () => void }) {
  const [lampiran, setLampiran] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLampiran();
  }, [sk._id]);

  const fetchLampiran = async () => {
    try {
      const res = await fetch(`/api/admin/sk-generator/${sk._id}`);
      const json = await res.json();
      if (res.ok) setLampiran(json.data.lampiran || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!title || !url) return alert("Judul dan URL wajib diisi");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return alert("URL harus diawali dengan http:// atau https://");
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sk-generator/${sk._id}/lampiran`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, fileUrl: url, lampiranType: "PEDOMAN_FILE" })
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle("");
      setUrl("");
      fetchLampiran();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus lampiran ini?")) return;
    try {
      const res = await fetch(`/api/admin/sk-generator/${sk._id}/lampiran?lampiranId=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(await res.text());
      fetchLampiran();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!isFinal && (
        <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
            Gunakan link dokumen pedoman yang dapat diakses oleh admin/pengelola RPL (Contoh: Google Drive).
          </p>
          <input 
            type="text" placeholder="Judul Lampiran" value={title} onChange={e=>setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
          />
          <input 
            type="text" placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
          />
          <button onClick={handleAdd} disabled={saving} style={{ padding: "8px 12px", background: "var(--md-primary)", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
            {saving ? "Menyimpan..." : "Tambah Lampiran Pedoman"}
          </button>
        </div>
      )}

      {lampiran.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {lampiran.map(l => (
            <li key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{l.title}</div>
                <a href={l.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--md-primary)" }}>Buka Link Dokumen &nearr;</a>
              </div>
              {!isFinal && (
                <button onClick={() => handleDelete(l._id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Hapus
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: 16 }}>Belum ada lampiran.</div>
      )}
    </div>
  );
}

function LampiranTimPengelola({ sk, isFinal, onRefresh }: { sk: any, isFinal: boolean, onRefresh: () => void }) {
  const [team, setTeam] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unsur, setUnsur] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [sk.periodId]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/admin/rpl-period-team?periodId=${sk.periodId}`);
      const json = await res.json();
      if (res.ok) setTeam(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!nama || !jabatan) return alert("Nama dan Jabatan wajib diisi");
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/rpl-period-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: sk.periodId, nama, jabatanDalamTim: jabatan, unsur })
      });
      if (!res.ok) throw new Error(await res.text());
      setNama(""); setJabatan(""); setUnsur("");
      fetchTeam();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus anggota ini?")) return;
    try {
      await fetch(`/api/admin/rpl-period-team/${id}`, { method: "DELETE" });
      fetchTeam();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!isFinal && (
        <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <input type="text" placeholder="Nama Lengkap & Gelar" value={nama} onChange={e=>setNama(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }} />
          <input type="text" placeholder="Jabatan dalam Tim (Misal: Ketua, Anggota)" value={jabatan} onChange={e=>setJabatan(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }} />
          <input type="text" placeholder="Unsur (Misal: Prodi, BAAK, dll)" value={unsur} onChange={e=>setUnsur(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }} />
          <button onClick={handleAdd} disabled={saving} style={{ padding: "8px 12px", background: "var(--md-primary)", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Tambah Anggota</button>
        </div>
      )}

      {team.length > 0 ? (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Nama</th>
              <th style={{ padding: 8 }}>Jabatan</th>
              {!isFinal && <th style={{ padding: 8 }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {team.map(t => (
              <tr key={t._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700 }}>{t.nama}</div>
                  <div style={{ color: "#64748b" }}>{t.unsur}</div>
                </td>
                <td style={{ padding: 8 }}>{t.jabatanDalamTim}</td>
                {!isFinal && (
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleDelete(t._id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 13, color: "#991b1b", textAlign: "center", padding: 16, background: "#fee2e2", borderRadius: 8 }}>Tim Pengelola periode ini belum diisi. Lengkapi data sebelum finalisasi SK Pengelola.</div>
      )}
    </div>
  );
}

function LampiranPenilai({ sk, isFinal, onRefresh }: { sk: any, isFinal: boolean, onRefresh: () => void }) {
  const [penilaiList, setPenilaiList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [klasters, setKlasters] = useState<any[]>([]);
  
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedKlaster, setSelectedKlaster] = useState("");
  const [jenis, setJenis] = useState("Internal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sk.periodId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/rpl-period-penilai?periodId=${sk.periodId}`);
      if (res.ok) {
        const json = await res.json();
        setPenilaiList(json.data || []);
      }
      
      const resUser = await fetch(`/api/admin/penilai`);
      if (resUser.ok) setUsers((await resUser.json()).data || []);

      const resKlas = await fetch(`/api/akademik/klaster`);
      if (resKlas.ok) setKlasters((await resKlas.json()).data || []);
      
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async () => {
    if (!selectedUser || !selectedKlaster) return alert("Pilih Penilai dan Klaster");
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/rpl-period-penilai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          periodId: sk.periodId, 
          penilaiId: selectedUser, 
          jenisPenilai: jenis,
          klasterIds: [selectedKlaster]
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      setSelectedUser("");
      setSelectedKlaster("");
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus penilai ini dari periode?")) return;
    try {
      await fetch(`/api/admin/rpl-period-penilai/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e: any) {
      alert("Gagal: " + e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!isFinal && (
        <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}>
            <option value="">-- Pilih Penilai --</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
          
          <select value={selectedKlaster} onChange={e=>setSelectedKlaster(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}>
            <option value="">-- Pilih Klaster Keahlian --</option>
            {klasters.map(k => <option key={k._id} value={k._id}>{k.kode} - {k.nama}</option>)}
          </select>

          <select value={jenis} onChange={e=>setJenis(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}>
            <option value="Internal">Internal</option>
            <option value="Eksternal">Eksternal</option>
            <option value="Praktisi">Praktisi</option>
            <option value="Akademisi">Akademisi</option>
          </select>
          
          <button onClick={handleAdd} disabled={saving} style={{ padding: "8px 12px", background: "var(--md-primary)", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Tambah Penilai Periode</button>
        </div>
      )}

      {penilaiList.length > 0 ? (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Penilai</th>
              <th style={{ padding: 8 }}>Klaster</th>
              <th style={{ padding: 8 }}>Status</th>
              {!isFinal && <th style={{ padding: 8 }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {penilaiList.map(p => (
              <tr key={p._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700 }}>{p.penilaiId?.name}</div>
                  <div style={{ color: "#64748b" }}>{p.jenisPenilai}</div>
                </td>
                <td style={{ padding: 8 }}>
                  {p.klasterIds?.map((k:any) => <div key={k._id}>{k.nama}</div>)}
                </td>
                <td style={{ padding: 8 }}>
                  {p.isEligibleForPlotting ? 
                    <span style={{ color: "#166534", background: "#dcfce7", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Eligible</span> : 
                    <span style={{ color: "#991b1b", background: "#fee2e2", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Draf</span>
                  }
                </td>
                {!isFinal && (
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleDelete(p._id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 13, color: "#991b1b", textAlign: "center", padding: 16, background: "#fee2e2", borderRadius: 8 }}>Daftar Penilai periode ini belum diisi. Lengkapi data sebelum finalisasi SK Penilai.</div>
      )}
    </div>
  );
}

function LampiranPenugasan({ sk }: { sk: any }) {
  const [plotting, setPlotting] = useState<any[]>([]);

  useEffect(() => {
    fetchPlotting();
  }, []);

  const fetchPlotting = async () => {
    try {
      const res = await fetch(`/api/admin/plotting-f03?statusPlotting=Sudah Diplotting`);
      if (res.ok) {
        const json = await res.json();
        const activeOnly = json.data.filter((d: any) => d.plottingStatus === "Sudah Diplotting" && d.penilaiId);
        setPlotting(activeOnly);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {plotting.length > 0 ? (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Mahasiswa</th>
              <th style={{ padding: 8 }}>Klaster</th>
              <th style={{ padding: 8 }}>Penilai</th>
            </tr>
          </thead>
          <tbody>
            {plotting.map((p, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700 }}>{p.mahasiswaNama}</div>
                  <div style={{ color: "#64748b" }}>{p.username}</div>
                </td>
                <td style={{ padding: 8 }}>{p.klasterName}</td>
                <td style={{ padding: 8, fontWeight: 700 }}>{p.penilaiNama}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: 16 }}>Belum ada penugasan aktif (Plotting kosong).</div>
      )}
    </div>
  );
}
