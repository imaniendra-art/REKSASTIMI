import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const rplSkLampiranSchema = new Schema(
  {
    skDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "RplSkDocument",
      required: true
    },
    periodId: {
      type: Schema.Types.ObjectId,
      ref: "Period",
      required: true
    },
    lampiranType: {
      type: String,
      enum: [
        "PEDOMAN_FILE",
        "DAFTAR_PENGELOLA",
        "DAFTAR_PENILAI",
        "DAFTAR_PENUGASAN",
        "HASIL_RPL",
        "NILAI_KONVERSI",
        "FILE_UPLOAD",
        "LAINNYA"
      ],
      required: true
    },
    title: {
      type: String
    },
    rows: {
      type: [Schema.Types.Mixed],
      default: []
    },
    fileUrl: {
      type: String
    },
    originalFileName: {
      type: String
    },
    order: {
      type: Number,
      default: 1
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

export type RplSkLampiranType = InferSchemaType<typeof rplSkLampiranSchema>;

export const RplSkLampiran =
  (models.RplSkLampiran as Model<RplSkLampiranType> | undefined) ?? 
  model<RplSkLampiranType>("RplSkLampiran", rplSkLampiranSchema);
