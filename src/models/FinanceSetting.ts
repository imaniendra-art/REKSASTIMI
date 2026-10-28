import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFinanceSetting extends Document {
  registrationFee: number;
  assessmentFee: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  treasurerName: string;
  institutionName: string;
  updatedAt: Date;
}

const FinanceSettingSchema = new Schema<IFinanceSetting>(
  {
    registrationFee: {
      type: Number,
      required: true,
      default: 250000,
    },
    assessmentFee: {
      type: Number,
      required: true,
      default: 0,
    },
    bankName: {
      type: String,
      required: true,
      default: "Bank Rakyat Indonesia (BRI)",
    },
    accountNumber: {
      type: String,
      required: true,
      default: "3419-0106-7835-533",
    },
    accountHolder: {
      type: String,
      required: true,
      default: "RPL STIMI YAPMI Makassar",
    },
    treasurerName: {
      type: String,
      required: true,
      default: "Riswan, S.E. (Bendahara RPL)",
    },
    institutionName: {
      type: String,
      required: true,
      default: "STIMI YAPMI Makassar",
    },
  },
  {
    timestamps: true,
  }
);

export const FinanceSetting: Model<IFinanceSetting> =
  mongoose.models.FinanceSetting ||
  mongoose.model<IFinanceSetting>("FinanceSetting", FinanceSettingSchema);
