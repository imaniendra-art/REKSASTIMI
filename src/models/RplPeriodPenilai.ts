import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const rplPeriodPenilaiSchema = new Schema(
  {
    periodId: {
      type: Schema.Types.ObjectId,
      ref: "Period",
      required: true
    },
    penilaiId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jenisPenilai: {
      type: String,
      enum: ["Akademisi", "Praktisi", "Internal", "Eksternal"]
    },
    klasterIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Klaster" }],
      default: []
    },
    skDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "RplSkDocument"
    },
    isEligibleForPlotting: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
rplPeriodPenilaiSchema.index({ periodId: 1, penilaiId: 1 }, { unique: true });
rplPeriodPenilaiSchema.index({ periodId: 1, isEligibleForPlotting: 1 });

export type RplPeriodPenilaiType = InferSchemaType<typeof rplPeriodPenilaiSchema>;

export const RplPeriodPenilai =
  (models.RplPeriodPenilai as Model<RplPeriodPenilaiType> | undefined) ?? 
  model<RplPeriodPenilaiType>("RplPeriodPenilai", rplPeriodPenilaiSchema);
