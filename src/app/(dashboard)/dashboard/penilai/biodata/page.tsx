"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/dashboard/UIComponents";

export default function BiodataPenilaiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ttdFile, setTtdFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/penilai/biodata");
      if (!res.ok) throw new Error("Gagal mengambil data biodata");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "image/png") {
        alert("File harus berformat PNG");
        e.target.value = "";
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        e.target.value = "";
        return;
      }
      setTtdFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const payload: any = Object.fromEntries(formData.entries());

      // Parse nested objects for riwayatPendidikan, pengalamanMengajar dll jika diperlukan
      // For simplicity we will handle the arrays manually
      const pengalamanMengajar = [];
      for (let i = 1; i <= 5; i++) {
        if (payload[`mk_${i}`] || payload[`inst_${i}`]) {
          pengalamanMengajar.push({
            mataKuliah: payload[`mk_${i}`],
            institusi: payload[`inst_${i}`],
            tahun: payload[`tahun_mk_${i}`]
          });
        }
      }

      const pengalamanIndustri = [];
      for (let i = 1; i <= 3; i++) {
        if (payload[`pt_${i}`] || payload[`pos_${i}`]) {
          pengalamanIndustri.push({
            perusahaan: payload[`pt_${i}`],
            posisi: payload[`pos_${i}`],
            tahun: payload[`tahun_pt_${i}`]
          });
        }
      }

      const sertifikasiProfesi = [];
      for (let i = 1; i <= 3; i++) {
        if (payload[`cert_${i}`] || payload[`lembaga_${i}`]) {
          sertifikasiProfesi.push({
            namaSertifikat: payload[`cert_${i}`],
            lembaga: payload[`lembaga_${i}`],
            tahun: payload[`tahun_cert_${i}`]
          });
        }
      }

      payload.pengalamanMengajar = pengalamanMengajar;
      payload.pengalamanIndustri = pengalamanIndustri;
      payload.sertifikasiProfesi = sertifikasiProfesi;
      
      payload.riwayatPendidikan = {
        s1: { kampus: payload.s1_kampus, tahunLulus: payload.s1_tahun, prodi: payload.s1_prodi },
        s2: { kampus: payload.s2_kampus, tahunLulus: payload.s2_tahun, prodi: payload.s2_prodi },
        s3: { kampus: payload.s3_kampus, tahunLulus: payload.s3_tahun, prodi: payload.s3_prodi }
      };

      // Upload TTD if exists
      if (ttdFile) {
        const ttdData = new FormData();
        ttdData.append("file", ttdFile);
        const ttdRes = await fetch("/api/upload/ttd", {
          method: "POST",
          body: ttdData
        });
        const ttdJson = await ttdRes.json();
        if (!ttdRes.ok) throw new Error(ttdJson.message || "Gagal upload TTD");
        payload.scanTtdUrl = ttdJson.url;
      } else {
        payload.scanTtdUrl = data.profile?.scanTtdUrl || "";
      }

      const res = await fetch("/api/penilai/biodata", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal menyimpan biodata");
      }

      setMessage("Biodata berhasil disimpan");
      setTtdFile(null);
      fetchData();
      
      // scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, display: "block" };
  const sectionStyle = { background: "#fff", padding: 24, borderRadius: 16, marginBottom: 24, border: "1px solid #e2e8f0" };
  const titleStyle = { fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" };

  if (loading) return <div style={{ padding: 24 }}>Memuat...</div>;
  if (!data) return <div style={{ padding: 24 }}>Data tidak ditemukan</div>;

  const profile = data.profile || {};
  const jenisPenilai = profile.jenisPenilai || "";

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <PageHero
        badgeText="Profil Anda"
        title="Lengkapi Biodata"
        subtitle="Data ini akan digunakan untuk keperluan cetak form F04/F05 sebagai bagian dari dokumen mutu RPL."
        tone="primary"
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

      <form onSubmit={handleSubmit}>
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Informasi Dasar</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            <div><label style={labelStyle}>Nama Lengkap & Gelar</label><input name="namaLengkap" defaultValue={data.user?.name} required style={inputStyle} /></div>
            <div><label style={labelStyle}>Email</label><input name="email" type="email" defaultValue={data.user?.email} style={inputStyle} /></div>
            <div><label style={labelStyle}>NIDN / NIK / NIP</label><input name="nidn" defaultValue={profile.nidn} style={inputStyle} /></div>
            <div><label style={labelStyle}>No HP / WhatsApp</label><input name="noHp" defaultValue={profile.noHp} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Jenis Penilai</label>
              <select name="jenisPenilai" defaultValue={jenisPenilai} required style={inputStyle}>
                <option value="">-- Pilih --</option>
                <option value="Akademisi">Akademisi (F04)</option>
                <option value="Praktisi">Praktisi (F05)</option>
                <option value="Internal">Internal</option>
                <option value="Eksternal">Eksternal</option>
              </select>
            </div>
            <div><label style={labelStyle}>Instansi Saat Ini</label><input name="instansi" defaultValue={profile.instansi} style={inputStyle} /></div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={titleStyle}>Identitas Pribadi</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Jenis Kelamin</label>
              <select name="jenisKelamin" defaultValue={profile.jenisKelamin} style={inputStyle}>
                <option value="">-- Pilih --</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>
            <div><label style={labelStyle}>Tempat Lahir</label><input name="tempatLahir" defaultValue={profile.tempatLahir} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Tanggal Lahir</label>
              <input type="date" name="tanggalLahir" defaultValue={profile.tanggalLahir ? profile.tanggalLahir.split("T")[0] : ""} style={inputStyle} />
            </div>
            <div><label style={labelStyle}>NIK (KTP)</label><input name="nik" defaultValue={profile.nik} style={inputStyle} /></div>
            <div><label style={labelStyle}>Pendidikan Terakhir</label><input name="pendidikanTerakhir" defaultValue={profile.pendidikanTerakhir} placeholder="Mis: S3 Manajemen" style={inputStyle} /></div>
            <div><label style={labelStyle}>Prodi Keilmuan</label><input name="prodiKeilmuan" defaultValue={profile.prodiKeilmuan} style={inputStyle} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Alamat Rumah</label><textarea name="alamatRumah" defaultValue={profile.alamatRumah} style={inputStyle} rows={2} /></div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={titleStyle}>Scan Tanda Tangan (Format PNG Transparan)</h3>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 120, height: 80, border: "1px dashed #cbd5e1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8fafc" }}>
              {profile.scanTtdUrl ? (
                <img src={profile.scanTtdUrl} alt="TTD" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>Belum ada TTD</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input type="file" onChange={handleFileChange} accept="image/png" style={{ ...inputStyle, padding: 8 }} />
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 8, margin: 0 }}>Upload file PNG baru untuk mengganti TTD lama. Ukuran maks: 2MB.</p>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={titleStyle}>Riwayat Pendidikan Formal</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", fontSize: 12, color: "#475569" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Jenjang</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Nama Perguruan Tinggi</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Tahun Lulus</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Bidang Ilmu / Prodi</th>
                </tr>
              </thead>
              <tbody>
                {["s1", "s2", "s3"].map((j) => (
                  <tr key={j} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: 12, fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{j}</td>
                    <td style={{ padding: 12 }}><input name={`${j}_kampus`} defaultValue={profile.riwayatPendidikan?.[j]?.kampus} style={inputStyle} placeholder="Kampus..." /></td>
                    <td style={{ padding: 12 }}><input name={`${j}_tahun`} defaultValue={profile.riwayatPendidikan?.[j]?.tahunLulus} style={inputStyle} placeholder="20XX" /></td>
                    <td style={{ padding: 12 }}><input name={`${j}_prodi`} defaultValue={profile.riwayatPendidikan?.[j]?.prodi} style={inputStyle} placeholder="Prodi..." /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {jenisPenilai === "Akademisi" && (
          <div style={sectionStyle}>
            <h3 style={titleStyle}>Data Akademik & Pengalaman Mengajar</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={labelStyle}>Nama PT Homebase</label><input name="namaPT" defaultValue={profile.namaPT} style={inputStyle} /></div>
              <div><label style={labelStyle}>Alamat PT</label><input name="alamatPT" defaultValue={profile.alamatPT} style={inputStyle} /></div>
            </div>
            
            <label style={labelStyle}>Pengalaman Mengajar / Asesmen (5 Terakhir)</label>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eff6ff", color: "#1e40af", fontSize: 12 }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Mata Kuliah / Bidang</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Institusi</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 12 }}><input name={`mk_${i}`} defaultValue={profile.pengalamanMengajar?.[i-1]?.mataKuliah} style={inputStyle} placeholder="Matkul..." /></td>
                      <td style={{ padding: 12 }}><input name={`inst_${i}`} defaultValue={profile.pengalamanMengajar?.[i-1]?.institusi} style={inputStyle} placeholder="Kampus/Lembaga..." /></td>
                      <td style={{ padding: 12 }}><input name={`tahun_mk_${i}`} defaultValue={profile.pengalamanMengajar?.[i-1]?.tahun} style={inputStyle} placeholder="20XX" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {jenisPenilai === "Praktisi" && (
          <div style={sectionStyle}>
            <h3 style={titleStyle}>Data Pekerjaan & Pengalaman Industri</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={labelStyle}>Pekerjaan / Jabatan Saat Ini</label><input name="pekerjaan" defaultValue={profile.pekerjaan} style={inputStyle} /></div>
              <div><label style={labelStyle}>Instansi / Perusahaan</label><input name="instansiKerja" defaultValue={profile.instansiKerja} style={inputStyle} /></div>
              <div><label style={labelStyle}>Telp Kantor</label><input name="telpKantor" defaultValue={profile.telpKantor} style={inputStyle} /></div>
            </div>

            <label style={labelStyle}>Pengalaman Industri (3 Terakhir)</label>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f0fdf4", color: "#166534", fontSize: 12 }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Nama Perusahaan</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Posisi / Jabatan</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 12 }}><input name={`pt_${i}`} defaultValue={profile.pengalamanIndustri?.[i-1]?.perusahaan} style={inputStyle} placeholder="Perusahaan..." /></td>
                      <td style={{ padding: 12 }}><input name={`pos_${i}`} defaultValue={profile.pengalamanIndustri?.[i-1]?.posisi} style={inputStyle} placeholder="Posisi..." /></td>
                      <td style={{ padding: 12 }}><input name={`tahun_pt_${i}`} defaultValue={profile.pengalamanIndustri?.[i-1]?.tahun} style={inputStyle} placeholder="20XX - 20XX" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label style={labelStyle}>Sertifikasi Profesi (3 Terakhir)</label>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fffbeb", color: "#92400e", fontSize: 12 }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Nama Sertifikasi</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Lembaga Penerbit</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 12 }}><input name={`cert_${i}`} defaultValue={profile.sertifikasiProfesi?.[i-1]?.namaSertifikat} style={inputStyle} placeholder="Nama Sertifikat..." /></td>
                      <td style={{ padding: 12 }}><input name={`lembaga_${i}`} defaultValue={profile.sertifikasiProfesi?.[i-1]?.lembaga} style={inputStyle} placeholder="Lembaga..." /></td>
                      <td style={{ padding: 12 }}><input name={`tahun_cert_${i}`} defaultValue={profile.sertifikasiProfesi?.[i-1]?.tahun} style={inputStyle} placeholder="20XX" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={sectionStyle}>
          <h3 style={titleStyle}>Asosiasi Profesi & Keahlian</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Bidang Keahlian Spesifik</label><input name="bidangKeahlianKerja" defaultValue={profile.bidangKeahlianKerja} placeholder="Mis: Akuntansi / SDM" style={inputStyle} /></div>
            <div><label style={labelStyle}>Nama Asosiasi</label><input name="namaAsosiasi" defaultValue={profile.namaAsosiasi} style={inputStyle} /></div>
            <div><label style={labelStyle}>No. Anggota</label><input name="noAnggotaAsosiasi" defaultValue={profile.noAnggotaAsosiasi} style={inputStyle} /></div>
            <div><label style={labelStyle}>Jabatan di Asosiasi</label><input name="jabatanAsosiasi" defaultValue={profile.jabatanAsosiasi} style={inputStyle} /></div>
            <div><label style={labelStyle}>Telp / Fax Asosiasi</label><input name="telpFaxAsosiasi" defaultValue={profile.telpFaxAsosiasi} style={inputStyle} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Alamat Asosiasi</label><input name="alamatAsosiasi" defaultValue={profile.alamatAsosiasi} style={inputStyle} /></div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 24 }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              background: "var(--md-primary)", 
              color: "#fff", 
              padding: "14px 28px", 
              borderRadius: 12, 
              fontWeight: 800, 
              fontSize: 14, 
              border: "none", 
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(13, 110, 253, 0.2)"
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Biodata Profil"}
          </button>
        </div>

      </form>
    </div>
  );
}
