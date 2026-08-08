import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const klasterMatkulSchema = new Schema(
  {
    klasterId: {
      type: Schema.Types.ObjectId,
      ref: "Klaster",
      required: true,
      index: true
    },
    matkulId: {
      type: Schema.Types.ObjectId,
      ref: "MataKuliah",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

klasterMatkulSchema.index({ klasterId: 1, matkulId: 1 }, { unique: true });

export type KlasterMatkulDocument = InferSchemaType<typeof klasterMatkulSchema> & { _id: string; createdAt: Date; updatedAt: Date };

export const KlasterMatkul =
  (models.KlasterMatkul as Model<KlasterMatkulDocument> | undefined) ??
  model<KlasterMatkulDocument>("KlasterMatkul", klasterMatkulSchema);
