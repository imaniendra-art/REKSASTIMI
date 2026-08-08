import mongoose from "mongoose";

const RecognizedCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah", required: true },
  kode: { type: String, required: true },
  nama: { type: String, required: true },
  sks: { type: Number, required: true },
  jenisRekognisi: { type: String, enum: ["Transfer SKS", "Perolehan SKS"], required: true },
  nilaiAngka: { type: Number },
  nilaiHuruf: { type: String },
  sumber: { type: String },
  klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster" },
  penilaiId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  suggestedJenisRekognisi: { type: String, enum: ["Transfer SKS", "Perolehan SKS"] },
  needsRekognisiValidation: { type: Boolean, default: false },
  rekognisiSourceNote: { type: String }
});

const RplFinalResultSchema = new mongoose.Schema(
  {
    mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    periodId: { type: mongoose.Schema.Types.ObjectId, ref: "Period" },
    nomorSk: { type: String },
    nomorBa: { type: String },
    tanggalPleno: { type: Date },
    totalSksTransfer: { type: Number, default: 0 },
    totalSksPerolehan: { type: Number, default: 0 },
    totalSksDiakui: { type: Number, default: 0 },
    recognizedCourses: [RecognizedCourseSchema],
    statusFinalisasi: {
      type: String,
      enum: ["DRAFT", "FINAL"],
      default: "DRAFT"
    },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    finalizedAt: { type: Date },

    mahasiswaDecisionStatus: {
      type: String,
      enum: ["BELUM_DIKIRIM", "MENUNGGU_RESPON", "DITERIMA", "DISANGGAH", "SANGGAHAN_SELESAI"],
      default: "BELUM_DIKIRIM"
    },
    sentToStudentAt: { type: Date },
    acceptedAt: { type: Date },
    sanggahanId: { type: mongoose.Schema.Types.ObjectId, ref: "RplSanggahan" },
    readyForPlenoAt: { type: Date },
    plenoStatus: {
      type: String,
      enum: ["BELUM_PLENO", "SIAP_PLENO", "SUDAH_PLENO"],
      default: "BELUM_PLENO"
    },
    baPlenoSkId: { type: mongoose.Schema.Types.ObjectId, ref: "RplSkDocument" },
    skHasilRplId: { type: mongoose.Schema.Types.ObjectId, ref: "RplSkDocument" }
  },
  { timestamps: true }
);

RplFinalResultSchema.index({ mahasiswaId: 1, periodId: 1 });
RplFinalResultSchema.index({ statusFinalisasi: 1 });

export const RplFinalResult =
  mongoose.models.RplFinalResult || mongoose.model("RplFinalResult", RplFinalResultSchema);
