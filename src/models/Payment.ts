import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    jenisPembayaran: {
      type: String,
      required: true,
      trim: true
    },
    tanggalBayar: {
      type: Date,
      required: true
    },
    nominal: {
      type: Number,
      required: true
    },
    keterangan: {
      type: String,
      trim: true
    },
    buktiBayar: {
      type: String, // File path/URL of the uploaded receipt
      required: true
    },
    statusVerifikasi: {
      type: String,
      enum: ["Proses", "Diterima", "Ditolak"],
      default: "Proses",
      index: true
    },
    catatanAdmin: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema> & { _id: string; createdAt: Date; updatedAt: Date; };

export const Payment = (models.Payment as Model<PaymentDocument>) || model<PaymentDocument>("Payment", paymentSchema);
