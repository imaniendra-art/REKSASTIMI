import mongoose from "mongoose";

const RplSanggahanSchema = new mongoose.Schema({
  mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  periodId: { type: mongoose.Schema.Types.ObjectId, ref: "Period", required: true },
  finalResultId: { type: mongoose.Schema.Types.ObjectId, ref: "RplFinalResult", required: true },
  
  decision: { type: String, enum: ["TERIMA_HASIL", "AJUKAN_SANGGAHAN"], required: true },
  status: { type: String, enum: ["SUBMITTED", "DITINDAKLANJUTI", "SELESAI", "DITOLAK"], default: "SUBMITTED" },
  
  catatanMahasiswa: { type: String }, // Optional for TERIMA_HASIL, required for AJUKAN_SANGGAHAN (validated in API)
  catatanAdmin: { type: String },
  
  submittedAt: { type: Date, default: Date.now },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
}, { timestamps: true });

RplSanggahanSchema.index({ mahasiswaId: 1, periodId: 1, finalResultId: 1 });
RplSanggahanSchema.index({ periodId: 1, status: 1 });

export const RplSanggahan = mongoose.models.RplSanggahan || mongoose.model("RplSanggahan", RplSanggahanSchema);
