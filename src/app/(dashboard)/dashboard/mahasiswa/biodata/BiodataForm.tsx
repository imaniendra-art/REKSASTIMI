"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBiodata } from "./actions";

/* ── Shared style helpers ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "2px solid #cbd5e1",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "border 200ms, box-shadow 200ms, background 200ms",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--md-on-surface-variant)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const requiredStar: React.CSSProperties = {
  color: "#ef4444",
  marginLeft: 2,
};

const sectionCard: React.CSSProperties = {
  background: "var(--md-surface)",
  borderRadius: 20,
  padding: "28px 28px 32px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid var(--md-outline-variant)",
  position: "relative",
  overflow: "hidden",
};

const accentBar = (color: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: 4,
  height: "100%",
  background: color,
  borderRadius: "20px 0 0 20px",
});

const sectionTitle = (color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 800,
  fontSize: 14,
  color: color,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 24,
});

export default function BiodataForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  const ident = initialData?.identity || {};
  const cont = initialData?.contact || {};

  const formattedDateOfBirth = ident.dateOfBirth
    ? new Date(ident.dateOfBirth).toISOString().split("T")[0]
    : "";

  const docs = initialData?.documents || [];
  const getDoc = (type: string) => docs.find((d: any) => d.type === type);
  const isUploaded = (type: string) => !!getDoc(type) || !!selectedFiles[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    
    // Explicitly set the files into formData from state just in case
    // the uncontrolled inputs did not serialize them properly.
    if (selectedFiles.kk) formData.set("file_kk", selectedFiles.kk);
    if (selectedFiles.ktp) formData.set("file_ktp", selectedFiles.ktp);
    if (selectedFiles.ijazah) formData.set("file_ijazah", selectedFiles.ijazah);
    if (selectedFiles.pendukung) formData.set("file_dukung", selectedFiles.pendukung);
    if (selectedFiles.ttd) formData.set("file_ttd", selectedFiles.ttd);

    const result = await saveBiodata(formData);

    if (result.success) {
      setMessage({ type: "success", text: "✅ Data biodata berhasil disimpan!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan data." });
    }
    setLoading(false);
  };

  /* ── Field renderers ── */
  function InputField({
    label,
    name,
    defaultValue,
    required,
    type = "text",
    placeholder,
    maxLength,
    minLength,
    mono,
  }: {
    label: string;
    name: string;
    defaultValue?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    mono?: boolean;
  }) {
    return (
      <div>
        <label style={labelBase}>
          {label}
          {required && <span style={requiredStar}>*</span>}
        </label>
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          style={{
            ...inputBase,
            fontFamily: mono ? "monospace" : "inherit",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1a56db";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
            e.currentTarget.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#fff";
          }}
        />
      </div>
    );
  }

  function SelectField({
    label,
    name,
    defaultValue,
    required,
    options,
  }: {
    label: string;
    name: string;
    defaultValue?: string;
    required?: boolean;
    options: { value: string; label: string }[];
  }) {
    return (
      <div>
        <label style={labelBase}>
          {label}
          {required && <span style={requiredStar}>*</span>}
        </label>
        <select
          name={name}
          defaultValue={defaultValue || ""}
          required={required}
          style={{
            ...inputBase,
            appearance: "none",
            cursor: "pointer",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231a56db' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: 40,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1a56db";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
            e.currentTarget.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#fff";
          }}
        >
          <option value="" disabled style={{ color: "#94a3b8" }}>
            ▼  Pilih
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function FileCard({
    label,
    name,
    docType,
    accept,
  }: {
    label: string;
    name: string;
    docType: string;
    accept: string;
  }) {
    const uploaded = isUploaded(docType);
    const pickedFile = selectedFiles[docType];
    const pickedName = pickedFile?.name;
    return (
      <div
        style={{
          background: "#fff",
          border: "2px solid #cbd5e1",
          borderRadius: 16,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "border 200ms, box-shadow 200ms",
          minHeight: 150,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--md-on-surface)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            {label}
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 6,
              background: uploaded ? "#d1fae5" : "#f1f5f9",
              color: uploaded ? "#065f46" : "#64748b",
              marginBottom: 14,
            }}
          >
            {uploaded ? "✅ Sudah Upload" : "📎 Belum Upload"}
          </div>
          {pickedName && (
            <p style={{ fontSize: 10, color: "#475569", marginBottom: 6, wordBreak: "break-all" }}>📄 {pickedName}</p>
          )}
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 11,
            fontWeight: 700,
            color: "#1a56db",
            background: "#eff6ff",
            border: "1.5px solid #93c5fd",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background 150ms, border-color 150ms",
            width: "100%",
            justifyContent: "center",
          }}
        >
          📂 Pilih File
          <input
            type="file"
            name={name}
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) {
                setSelectedFiles((prev) => ({ ...prev, [docType]: file }));
              }
            }}
          />
        </label>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <form encType="multipart/form-data" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Message */}
      {message.text && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1.5px solid ${message.type === "success" ? "#34d399" : "#f87171"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* ── Section 1: Detail Mahasiswa ── */}
      <div style={sectionCard}>
        <div style={accentBar("#1a56db")} />
        <div style={sectionTitle("#1a56db")}>
          <span style={{ fontSize: 20 }}>👤</span>
          1. Detail Mahasiswa
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          <InputField
            label="Nama Lengkap (Sesuai KTP)"
            name="nama_lengkap"
            defaultValue={ident.fullName}
            required
          />
          <InputField
            label="Nama di Ijazah (Jika Berbeda)"
            name="nama_ijazah"
            defaultValue={ident.nameOnCertificate || ident.fullName}
            required
          />
          <InputField
            label="Tempat Lahir"
            name="tempat_lahir"
            defaultValue={ident.placeOfBirth}
            required
          />
          <InputField
            label="Tanggal Lahir"
            name="tanggal_lahir"
            defaultValue={formattedDateOfBirth}
            type="date"
            required
          />
          <SelectField
            label="Jenis Kelamin"
            name="jenis_kelamin"
            defaultValue={ident.gender}
            required
            options={[
              { value: "L", label: "Laki-laki" },
              { value: "P", label: "Perempuan" },
            ]}
          />
          <SelectField
            label="Agama"
            name="agama"
            defaultValue={ident.religion}
            required
            options={[
              { value: "Islam", label: "Islam" },
              { value: "Kristen", label: "Kristen" },
              { value: "Katolik", label: "Katolik" },
              { value: "Hindu", label: "Hindu" },
              { value: "Budha", label: "Budha" },
              { value: "Konghucu", label: "Konghucu" },
            ]}
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <InputField
            label="Nama Ibu Kandung"
            name="nama_ibu"
            defaultValue={ident.motherName}
            required
            placeholder="Wajib diisi untuk PDDIKTI"
          />
        </div>
      </div>

      {/* ── Section 2: Informasi Detail ── */}
      <div style={sectionCard}>
        <div style={accentBar("#6366f1")} />
        <div style={sectionTitle("#6366f1")}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          2. Informasi Detail Mahasiswa
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          <SelectField
            label="Kewarganegaraan"
            name="kewarganegaraan"
            defaultValue={ident.citizenship || "Indonesia"}
            required
            options={[
              { value: "Indonesia", label: "Indonesia" },
              { value: "WNA", label: "WNA (Asing)" },
            ]}
          />
          <InputField
            label="NIK (No. KTP)"
            name="nik"
            defaultValue={ident.nik}
            required
            maxLength={16}
            placeholder="16 Digit Angka"
            mono
          />
          <InputField
            label="NISN"
            name="nisn"
            defaultValue={ident.nisn}
            required
            maxLength={10}
            minLength={10}
            placeholder="10 Digit Angka (Wajib)"
            mono
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <InputField
            label="Alamat Domisili (Jalan/RT/RW)"
            name="alamat"
            defaultValue={cont.address}
            required
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
            marginTop: 18,
          }}
        >
          <InputField
            label="Kelurahan / Desa"
            name="kelurahan"
            defaultValue={cont.village}
            required
          />
          <InputField
            label="Kecamatan"
            name="kecamatan"
            defaultValue={cont.district}
            required
          />
          <InputField
            label="Email Aktif"
            name="email"
            defaultValue={cont.email}
            type="email"
            required
          />
          <InputField
            label="No. HP / WhatsApp"
            name="no_hp"
            defaultValue={cont.phone}
            required
          />
        </div>
      </div>

      {/* ── Section 3: Upload Berkas ── */}
      <div
        style={{
          ...sectionCard,
          background: "var(--md-surface-variant)",
        }}
      >
        <div style={accentBar("#059669")} />
        <div style={sectionTitle("#059669")}>
          <span style={{ fontSize: 20 }}>☁️</span>
          3. Upload Berkas Diri & Dok. Pendukung
        </div>

        {/* Info box */}
        <div
          style={{
            background: "#e0f2fe",
            border: "1.5px solid #38bdf8",
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>ℹ️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#075985", marginBottom: 4 }}>
                Informasi Upload
              </p>
              <p style={{ fontSize: 12, color: "#075985", lineHeight: 1.6 }}>
                Format KTP/KK/Ijazah: <strong>JPG/PNG/PDF</strong>. Maksimal <strong>2MB</strong> per file.
              </p>
            </div>
          </div>

          {/* Pendukung detail */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #bae6fd",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#059669", whiteSpace: "nowrap" }}>
                📄 Khusus &ldquo;DOK. PENDUKUNG LAINNYA&rdquo;:
              </p>
              <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.6, flex: 1, minWidth: 200 }}>
                Mohon gabungkan bukti-bukti pendukung di bawah ini ke dalam <strong>1 (satu) file PDF bulat</strong> (maksimal 2MB):
              </p>
            </div>
            {(() => {
              const allItems = [
                "Ijazah/Transkrip Nilai PT asal",
                "Daftar Riwayat pekerjaan & tugas",
                "Sertifikat Kompetensi",
                "Sert. pengoperasian/lisensi jabatan",
                "Foto pekerjaan & deskripsi",
                "Buku harian",
                "Lembar tugas/kerja di perusahaan",
                "Dok. analisis/perancangan",
                "Logbook",
                "Catatan pelatihan di tempat kerja",
                "Keanggotaan asosiasi profesi",
                "Ref./verifikasi pihak 3 / supervisor",
                "Penghargaan dari industri",
                "Penilaian kinerja perusahaan",
                "Dokumen lain yang relevan",
              ];
              const cols = [allItems.slice(0, 5), allItems.slice(5, 10), allItems.slice(10, 15)];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 16px" }}>
                  {cols.map((col, ci) => (
                    <div key={ci}>
                      {col.map((item, ri) => {
                        const num = ci * 5 + ri + 1;
                        return (
                          <div
                            key={num}
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 6,
                              fontSize: 11,
                              color: "#475569",
                              lineHeight: 1.4,
                              padding: "4px 0",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <span style={{ fontWeight: 700, color: "#1a56db", minWidth: 20, textAlign: "right", flexShrink: 0 }}>{num}.</span>
                            <span>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          <FileCard label="Kartu Keluarga (KK)" name="file_kk" docType="kk" accept=".jpg,.jpeg,.png,.pdf" />
          <FileCard label="KTP Asli" name="file_ktp" docType="ktp" accept=".jpg,.jpeg,.png,.pdf" />
          <FileCard label="Ijazah SMA/Sederajat" name="file_ijazah" docType="ijazah" accept=".jpg,.jpeg,.png,.pdf" />
          <FileCard label="Dok. Pendukung Lainnya" name="file_dukung" docType="pendukung" accept=".pdf" />
          <FileCard label="Tanda Tangan Digital" name="file_ttd" docType="ttd" accept=".jpg,.jpeg,.png,.pdf" />
        </div>
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #1a56db, #6366f1)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px 24px",
          fontSize: 15,
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 6px 20px rgba(26,86,219,0.3)",
          transition: "opacity 200ms, transform 150ms, box-shadow 200ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          letterSpacing: "0.02em",
        }}
      >
        {loading ? (
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              border: "3px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <>💾 SIMPAN DATA PRIBADI</>
        )}
      </button>

      {/* Spinner keyframe via style tag */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  );
}
