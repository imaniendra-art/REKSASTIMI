import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { roles } from "@/types/roles";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: roles,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["aktif", "nonaktif"],
      default: "aktif",
      index: true
    },
    lastLoginAt: Date
  },
  {
    timestamps: true
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User =
  (models.User as Model<UserDocument> | undefined) ?? model<UserDocument>("User", userSchema);
