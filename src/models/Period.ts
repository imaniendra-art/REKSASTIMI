import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const periodSchema = new Schema(
  {
    namaPeriode: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: String,
      trim: true
    },
    tahunAkademik: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["Aktif", "Non-Aktif"],
      default: "Non-Aktif"
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

periodSchema.pre("save", async function (next) {
  // If status is set directly, sync isActive
  if (this.isModified("status")) {
    this.isActive = this.status === "Aktif";
  } else if (this.isModified("isActive")) {
    this.status = this.isActive ? "Aktif" : "Non-Aktif";
  }

  // Ensure only one active period
  if (this.isActive) {
    const PeriodModel = this.constructor as Model<PeriodDocument>;
    await PeriodModel.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false, status: "Non-Aktif" } }
    );
  }

  next();
});

export type PeriodDocument = InferSchemaType<typeof periodSchema>;

export const Period =
  (models.Period as Model<PeriodDocument> | undefined) ?? model<PeriodDocument>("Period", periodSchema);
