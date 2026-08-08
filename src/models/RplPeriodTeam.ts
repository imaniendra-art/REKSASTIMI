import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const rplPeriodTeamSchema = new Schema(
  {
    periodId: {
      type: Schema.Types.ObjectId,
      ref: "Period",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    nama: {
      type: String,
      required: true
    },
    jabatanDalamTim: {
      type: String,
      required: true
    },
    unsur: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    skDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "RplSkDocument"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
rplPeriodTeamSchema.index({ periodId: 1, nama: 1, jabatanDalamTim: 1 });

export type RplPeriodTeamType = InferSchemaType<typeof rplPeriodTeamSchema>;

export const RplPeriodTeam =
  (models.RplPeriodTeam as Model<RplPeriodTeamType> | undefined) ?? 
  model<RplPeriodTeamType>("RplPeriodTeam", rplPeriodTeamSchema);
