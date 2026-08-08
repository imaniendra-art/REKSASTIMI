import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const optionSchema = new Schema(
  {
    label: { type: String, required: true }, // e.g., 'A', 'B', 'C', 'D'
    text: { type: String, required: true },
  },
  { _id: false }
);

const assessmentQuestionSchema = new Schema(
  {
    klaster: {
      type: Schema.Types.ObjectId,
      ref: "Klaster",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "MataKuliah",
      required: false,
    },
    type: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "ESSAY"],
      default: "MULTIPLE_CHOICE",
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    correctAnswer: {
      type: String, // Matches the label of the correct option
    },
    score: {
      type: Number,
      default: 10,
    },
    order: {
      type: Number,
      default: 0,
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

export type AssessmentQuestionDocument = InferSchemaType<typeof assessmentQuestionSchema> & { _id: string; createdAt: Date; updatedAt: Date };

export const AssessmentQuestion =
  (models.AssessmentQuestion as Model<AssessmentQuestionDocument> | undefined) ??
  model<AssessmentQuestionDocument>("AssessmentQuestion", assessmentQuestionSchema);
