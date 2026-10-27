"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBiodata } from "./actions";

/* ── Shared style helpers ── */
const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--md-surface-1)",
  border: "1px solid var(--md-outline)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--md-on-surface)",
  outline: "none",
  transition: "all 0.18s ease",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--md-on-surface-variant)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const requiredStar: React.CSSProperties = {
  color: "var(--md-error)",
  marginLeft: 3,
};

const sectionCard: React.CSSProperties = {
  background: "var(--md-surface-1)",
  borderRadius: 20,
  padding: "26px 28px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
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
  fontWeight: 900,
  fontSize: 14,
  color: color,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 20,
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
    
    if (selectedFiles.kk) formData.set("file_kk", selectedFiles.kk);
    if (selectedFiles.ktp) formData.set("file_ktp", selectedFiles.ktp);
    if (selectedFiles.ijazah) formData.set("file_ijazah", selectedFiles.ijazah);
    if (selectedFiles.pendukung) formData.set("file_dukung", selectedFiles.pendukung);
    if (selectedFiles.ttd) formData.set("file_ttd", selectedFiles.ttd);

    const result = await saveBiodata(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Data biodata dan berkas berhasil disimpan!" });
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
            e.currentTarget.style.borderColor = "var(--md-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--md-outline)";
            e.currentTarget.style.boxShadow = "none";
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
            cursor: "pointer",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--md-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--theme-ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--md-outline)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <option value="" disabled style={{ color: "var(--md-on-surface-variant)" }}>
            -- Pilih Opsi --
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
    const existingDoc = getDoc(docType);
    const pickedFile = selectedFiles[docType];
    const pickedName = pickedFile?.name;

    return (
      <div
        style={{
          background: "var(--md-surface-2)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: 16,
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 145,
          transition: "all 0.18s ease",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--md-on-surface)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            {label}
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 6,
              background: uploaded ? "var(--md-success-container)" : "var(--md-surface-1)",
              color: uploaded ? "var(--md-success)" : "var(--md-on-surface-variant)",
              border: "1px solid var(--md-outline-variant)",
              marginBottom: 10,
            }}
          >
            <span>{uploaded ? "✓ Terunggah" : "○ Belum Ada"}</span>
          </div>

          {pickedName && (
            <p style={{ fontSize: 10.5, color: "var(--md-primary)", fontWeight: 700, marginBottom: 8, wordBreak: "break-all" }}>
              File Baru: {pickedName}
            </p>
          )}

          {!pickedName && existingDoc?.fileUrl && (
            <div style={{ marginBottom: 8 }}>
              <a
                href={existingDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10.5, color: "var(--md-primary)", fontWeight: 700, textDecoration: "underline" }}
              >
                Lihat Berkas Aktif &rarr;
              </a>
            </div>
          )}
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--md-primary)",
            background: "var(--md-primary-container)",
            border: "1px solid var(--md-outline-variant)",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            justifyContent: "center",
            transition: "all 0.18s ease",
          }}
        >
          <span>Pilih Berkas</span>
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
    <form encType="multipart/form-data" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
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
            fontWeight: 800,
            background: message.type === "success" ? "var(--md-success-container)" : "var(--md-error-container)",
            color: message.type === "success" ? "var(--md-success)" : "var(--md-error)",
            border: `1.5px solid ${message.type === "success" ? "var(--md-success)" : "var(--md-error)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* ── Section 1: Detail Mahasiswa ── */}
      <div style={sectionCard}>
        <div style={accentBar("var(--md-primary)")} />
        <div style={sectionTitle("var(--md-primary)")}>
          1. Identitas Pokok Calon Mahasiswa
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
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

        <div style={{ marginTop: 16 }}>
          <InputField
            label="Nama Ibu Kandung"
            name="nama_ibu"
            defaultValue={ident.motherName}
            required
            placeholder="Wajib untuk sinkronisasi Neo Feeder PDDIKTI"
          />
        </div>
      </div>

      {/* ── Section 2: Informasi Detail Kependudukan & Kontak ── */}
      <div style={sectionCard}>
        <div style={accentBar("var(--md-secondary)")} />
        <div style={sectionTitle("var(--md-secondary)")}>
          2. Kependudukan, Alamat & Kontak Resmi
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <SelectField
            label="Kewarganegaraan"
            name="kewarganegaraan"
            defaultValue={ident.citizenship || "Indonesia"}
            required
            options={[
              { value: "Indonesia", label: "Indonesia (WNI)" },
              { value: "WNA", label: "WNA (Warga Negara Asing)" },
            ]}
          />
          <InputField
            label="Nomor Induk Kependudukan (NIK)"
            name="nik"
            defaultValue={ident.nik}
            required
            maxLength={16}
            placeholder="16 Digit Angka KTP"
            mono
          />
          <InputField
            label="Nomor Induk Siswa Nasional (NISN)"
            name="nisn"
            defaultValue={ident.nisn}
            required
            maxLength={10}
            minLength={10}
            placeholder="10 Digit Angka (Wajib)"
            mono
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <InputField
            label="Alamat Lengkap Domisili (Jalan / Dusun / RT / RW)"
            name="alamat"
            defaultValue={cont.address}
            required
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
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
            label="Alamat Email Aktif"
            name="email"
            defaultValue={cont.email}
            type="email"
            required
          />
          <InputField
            label="Nomor WhatsApp Aktif"
            name="no_hp"
            defaultValue={cont.phone}
            required
          />
        </div>
      </div>

      {/* ── Section 3: Upload Berkas Dokumen ── */}
      <div style={sectionCard}>
        <div style={accentBar("var(--md-success)")} />
        <div style={sectionTitle("var(--md-success)")}>
          3. Berkas Legalitas & Portofolio Pendukung
        </div>

        {/* Info box */}
        <div
          style={{
            background: "var(--md-surface-2)",
            border: "1px solid var(--md-outline-variant)",
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--md-on-surface)", marginBottom: 4 }}>
            Ketentuan Dokumen Unggahan
          </p>
          <p style={{ fontSize: 12, color: "var(--md-on-surface-variant)", lineHeight: 1.55 }}>
            Format KTP, KK, Ijazah: <strong>JPG / PNG / PDF</strong> (Maksimal 2MB per file). Pastikan teks terbaca jelas dan tidak buram.
          </p>

          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              background: "var(--md-surface-1)",
              borderRadius: 12,
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            <p style={{ fontSize: 11.5, fontWeight: 800, color: "var(--md-primary)", marginBottom: 4 }}>
              Khusus &ldquo;Dokumen Pendukung Lainnya&rdquo;:
            </p>
            <p style={{ fontSize: 11, color: "var(--md-on-surface-variant)", lineHeight: 1.5 }}>
              Gabungkan sertifikat pelatihan, surat pengalaman kerja, SK jabatan, atau karya industri ke dalam <strong>1 file PDF</strong> (maksimal 2MB).
            </p>
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
          background: "var(--md-primary)",
          color: "var(--md-on-primary)",
          border: "none",
          borderRadius: 999,
          padding: "15px 24px",
          fontSize: 14,
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 4px 16px var(--theme-glow)",
          transition: "all 0.18s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {loading ? (
          <span>Menyimpan Biodata...</span>
        ) : (
          <span>Simpan Seluruh Data Biodata & Berkas &rarr;</span>
        )}
      </button>
    </form>
  );
}
