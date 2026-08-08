import mongoose from "mongoose";

const RplDocumentSchema = new mongoose.Schema(
  {
    mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Made optional
    periodId: { type: mongoose.Schema.Types.ObjectId, ref: "Period" },
    skDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "RplSkDocument" },
    documentType: {
      type: String,
      enum: [
        "F01",
        "F02",
        "F03",
        "F04",
        "F05",
        "F07",
        "SANGGAHAN",
        "BA_PLENO",
        "SK_HASIL",
        "LAMPIRAN_KONVERSI",
        "BUNDLE",
        "BUNDLE_PERIODE"
      ],
      required: true
    },
    title: { type: String },
    documentNumber: { type: String },
    manualNumberOverride: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Belum Siap", "Siap Cetak", "Sudah Dicetak", "Perlu Perbaikan", "DRAFT", "SIAP_CETAK", "FINAL", "ARSIP", "REVISI"],
      default: "DRAFT"
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    generatedAt: { type: Date },
    printedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    printedAt: { type: Date },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    finalizedAt: { type: Date },
    verifiedToken: { type: String },
    verifiedUrl: { type: String },
    qrPayload: { type: String },
    fileUrl: { type: String },
    version: { type: Number, default: 1 },
    isLatestVersion: { type: Boolean, default: true },
    previousDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "RplDocument" },
    revisedFromVersion: { type: Number },
    revisionReason: { type: String },
    revisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    revisedAt: { type: Date },
    dataSnapshot: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String }
  },
  { timestamps: true }
);

RplDocumentSchema.index({ mahasiswaId: 1, documentType: 1, version: 1 });
RplDocumentSchema.index({ documentNumber: 1 }, { unique: true, sparse: true });

export const RplDocument =
  mongoose.models.RplDocument || mongoose.model("RplDocument", RplDocumentSchema);
