import mongoose from "mongoose";

const PenilaiPlottingSchema = new mongoose.Schema(
  {
    mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
    penilaiId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      required: true,
      enum: ["Aktif", "Selesai", "Dibatalkan"],
      default: "Aktif",
    },
    catatanAdmin: { type: String },
    assignmentMode: { type: String, enum: ["Manual", "Auto"], default: "Manual" },
    assignedReason: { type: String },
    autoBatchId: { type: String },
    assignedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Satu mahasiswa pada satu klaster hanya boleh memiliki satu plotting utama
PenilaiPlottingSchema.index({ mahasiswaId: 1, klasterId: 1 }, { unique: true });

export const PenilaiPlotting =
  mongoose.models.PenilaiPlotting || mongoose.model("PenilaiPlotting", PenilaiPlottingSchema);
