import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const penilaiProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nidn: {
      type: String,
      trim: true,
    },
    namaLengkap: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    noHp: {
      type: String,
      trim: true,
    },
    jenisPenilai: {
      type: String,
      enum: ["Akademisi", "Praktisi", "Internal", "Eksternal"],
    },
    instansi: {
      type: String,
      trim: true,
    },
    jabatan: {
      type: String,
      trim: true,
    },
    jabatanFungsional: {
      type: String,
      trim: true,
    },
    pangkatGolongan: {
      type: String,
      trim: true,
    },
    bidangKeahlian: {
      type: String,
      trim: true,
    },
    pengalaman: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // ============================================
    // NEW BIODATA FIELDS (F04/F05 Integration)
    // ============================================
    
    // Identitas Pribadi Ekstra
    jenisKelamin: { type: String, enum: ["Pria", "Wanita"] },
    tempatLahir: { type: String, trim: true },
    tanggalLahir: { type: Date },
    nik: { type: String, trim: true },
    pendidikanTerakhir: { type: String, trim: true },
    prodiKeilmuan: { type: String, trim: true },
    alamatRumah: { type: String, trim: true },
    scanTtdUrl: { type: String, trim: true },
    
    // Riwayat Pendidikan Formal
    riwayatPendidikan: {
      s1: { kampus: String, tahunLulus: String, prodi: String },
      s2: { kampus: String, tahunLulus: String, prodi: String },
      s3: { kampus: String, tahunLulus: String, prodi: String },
    },
    
    // Data Akademik (Jika Akademisi)
    namaPT: { type: String, trim: true, default: "STIMI YAPMI Makassar" },
    alamatPT: { type: String, trim: true },
    pengalamanMengajar: [{
      mataKuliah: String,
      institusi: String,
      tahun: String
    }], // max 5
    
    // Data Praktisi (Jika Praktisi)
    pekerjaan: { type: String, trim: true },
    instansiKerja: { type: String, trim: true },
    telpKantor: { type: String, trim: true },
    pengalamanIndustri: [{
      perusahaan: String,
      posisi: String,
      tahun: String
    }], // max 3
    sertifikasiProfesi: [{
      namaSertifikat: String,
      lembaga: String,
      tahun: String
    }], // max 3
    
    // Asosiasi Profesi & Keahlian
    bidangKeahlianKerja: { type: String, trim: true }, // Spesifik
    namaAsosiasi: { type: String, trim: true },
    noAnggotaAsosiasi: { type: String, trim: true },
    jabatanAsosiasi: { type: String, trim: true },
    alamatAsosiasi: { type: String, trim: true },
    telpFaxAsosiasi: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export type PenilaiProfileDocument = InferSchemaType<typeof penilaiProfileSchema>;

export const PenilaiProfile =
  (models.PenilaiProfile as Model<PenilaiProfileDocument> | undefined) ??
  model<PenilaiProfileDocument>("PenilaiProfile", penilaiProfileSchema);
