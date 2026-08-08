import mongoose from "mongoose";

const F02PengajuanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matkulId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah", required: true },
    jenisPengajuan: {
      type: String,
      required: true,
      enum: ["Transfer", "Perolehan", "Keduanya"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same user and course
F02PengajuanSchema.index({ userId: 1, matkulId: 1 }, { unique: true });

export const F02Pengajuan = mongoose.models.F02Pengajuan || mongoose.model("F02Pengajuan", F02PengajuanSchema);
