import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const klasterSchema = new Schema(
  {
    namaKlaster: {
      type: String,
      required: true,
      trim: true
    },
    deskripsi: {
      type: String,
      trim: true,
      default: ""
    },
    lmsDeskripsi: {
      type: String,
      trim: true,
      default: ""
    },
    lmsVideos: {
      type: [String],
      default: []
    },
    lmsDocuments: {
      type: [{
        title: String,
        url: String
      }],
      default: []
    },
    gradeBooster: {
      type: Boolean,
      default: false
    },
    learningMaterials: {
      type: [{
        title: { type: String, trim: true, default: "" },
        description: { type: String, trim: true, default: "" },
        videoUrl: { type: String, trim: true, default: "" },
        pdfUrl: { type: String, trim: true, default: "" },
        courseId: { type: Schema.Types.ObjectId, ref: "MataKuliah", default: null },
        courseName: { type: String, trim: true, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        pretestQuestions: {
          type: [{
            questionText: { type: String, trim: true, default: "" },
            options: [{
              label: String,
              text: String
            }],
            correctAnswer: String,
            score: { type: Number, default: 0 },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true }
          }],
          default: []
        }
      }],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export type KlasterDocument = InferSchemaType<typeof klasterSchema> & { _id: string; createdAt: Date; updatedAt: Date };

export const Klaster =
  (models.Klaster as Model<KlasterDocument> | undefined) ??
  model<KlasterDocument>("Klaster", klasterSchema);
