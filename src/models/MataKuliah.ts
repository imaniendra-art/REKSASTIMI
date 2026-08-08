import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const matkulSchema = new Schema(
  {
    kode: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    namaMatkul: {
      type: String,
      required: true,
      trim: true
    },
    sks: {
      type: Number,
      required: true,
      default: 3
    },
    semester: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 8
    },
    kelompok: {
      type: String,
      trim: true,
      default: ""
    },
    konsentrasi: {
      type: String,
      trim: true,
      default: ""
    },
    isRpl: {
      type: Boolean,
      default: true,
      index: true
    },
    deskripsi: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export type MatkulDocument = InferSchemaType<typeof matkulSchema> & { _id: string; createdAt: Date; updatedAt: Date };

export const MataKuliah =
  (models.MataKuliah as Model<MatkulDocument> | undefined) ??
  model<MatkulDocument>("MataKuliah", matkulSchema);
