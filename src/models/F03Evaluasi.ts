import mongoose from "mongoose";

const F03EvaluasiSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah", required: true },
    assessmentAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentAttempt" },
    
    tingkatKemampuan: {
      type: String,
      required: true,
      enum: ["Sangat Baik", "Baik", "Cukup", "Kurang"],
    },
    
    jenisBukti: {
      type: [Number],
      required: true,
      default: [],
    },
    
    buktiFileUrl: { type: String },
    buktiFileName: { type: String },
    buktiFilePath: { type: String },
    
    statusValidasi: {
      type: [String],
      default: [],
    },
    
    nilaiHuruf: { type: String },
    catatanAsesor: { type: String },
    
    tanggalPenilaian: { type: Date },
    waktuPenilaian: { type: String },
    lokasiPenilaian: { type: String },
    penilai1: { type: String },
    penilai2: { type: String },
    
    isSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// Mencegah duplikasi data F03 untuk mahasiswa + klaster + matkul yang sama
F03EvaluasiSchema.index({ userId: 1, klasterId: 1, courseId: 1 }, { unique: true });

export const F03Evaluasi = mongoose.models.F03Evaluasi || mongoose.model("F03Evaluasi", F03EvaluasiSchema);
