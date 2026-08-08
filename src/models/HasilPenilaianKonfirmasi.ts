import mongoose from "mongoose";

const HasilPenilaianKonfirmasiSchema = new mongoose.Schema(
  {
    mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
    plottingId: { type: mongoose.Schema.Types.ObjectId, ref: "PenilaiPlotting", required: true },
    penilaiId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Belum Dikonfirmasi", "Dikonfirmasi", "Dikembalikan"],
      default: "Belum Dikonfirmasi"
    },
    catatanAdmin: { type: String },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: { type: Date }
  },
  { timestamps: true }
);

HasilPenilaianKonfirmasiSchema.index({ mahasiswaId: 1, klasterId: 1, plottingId: 1 }, { unique: true });

export const HasilPenilaianKonfirmasi =
  mongoose.models.HasilPenilaianKonfirmasi || mongoose.model("HasilPenilaianKonfirmasi", HasilPenilaianKonfirmasiSchema);
