import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const matkulCpmkSchema = new Schema(
  {
    matkulId: {
      type: Schema.Types.ObjectId,
      ref: "MataKuliah",
      required: true,
      index: true
    },
    nomorUrut: {
      type: Number,
      required: true
    },
    deskripsiCpmk: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export type MatkulCpmkDocument = InferSchemaType<typeof matkulCpmkSchema> & { _id: string; createdAt: Date; updatedAt: Date };

export const MatkulCpmk =
  (models.MatkulCpmk as Model<MatkulCpmkDocument> | undefined) ??
  model<MatkulCpmkDocument>("MatkulCpmk", matkulCpmkSchema);
