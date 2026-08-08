import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const rplSkDocumentSchema = new Schema(
  {
    periodId: {
      type: Schema.Types.ObjectId,
      ref: "Period",
      required: true
    },
    skType: {
      type: String,
      enum: [
        "SK_PMB_RPL",
        "SK_PEDOMAN_INSTITUSI",
        "SK_PEDOMAN_PRODI",
        "SK_PENGELOLA_RPL",
        "SK_PENILAI_RPL",
        "SK_PENUGASAN_PENILAI",
        "BA_PLENO",
        "SK_HASIL_RPL"
      ],
      required: true
    },
    skNumber: {
      type: String,
      default: null
    },
    manualNumberOverride: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    konsideranMenimbang: {
      type: [String],
      default: []
    },
    dasarHukum: {
      type: [String],
      default: []
    },
    diktumMenetapkan: {
      type: [String],
      default: []
    },
    signers: {
      type: [
        {
          nama: String,
          jabatan: String,
          role: String,
          signatureUrl: String,
          order: Number
        }
      ],
      default: []
    },
    status: {
      type: String,
      enum: ["DRAFT", "FINAL", "REVISI", "DIBATALKAN"],
      default: "DRAFT"
    },
    effectiveDate: {
      type: Date
    },
    finalizedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    finalizedAt: {
      type: Date
    },
    version: {
      type: Number,
      default: 1
    },
    dataSnapshot: {
      type: Schema.Types.Mixed
    },
    notes: {
      type: String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
rplSkDocumentSchema.index({ periodId: 1, skType: 1, version: 1 });
rplSkDocumentSchema.index({ periodId: 1, status: 1 });
rplSkDocumentSchema.index({ skNumber: 1 }, { sparse: true, unique: true });

export type RplSkDocumentType = InferSchemaType<typeof rplSkDocumentSchema>;

export const RplSkDocument =
  (models.RplSkDocument as Model<RplSkDocumentType> | undefined) ?? 
  model<RplSkDocumentType>("RplSkDocument", rplSkDocumentSchema);
