import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const penilaiKlasterSchema = new Schema(
  {
    penilaiId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    klasterId: {
      type: Schema.Types.ObjectId,
      ref: "Klaster",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

penilaiKlasterSchema.index({ penilaiId: 1, klasterId: 1 }, { unique: true });

export type PenilaiKlasterDocument = InferSchemaType<typeof penilaiKlasterSchema>;

export const PenilaiKlaster =
  (models.PenilaiKlaster as Model<PenilaiKlasterDocument> | undefined) ??
  model<PenilaiKlasterDocument>("PenilaiKlaster", penilaiKlasterSchema);
