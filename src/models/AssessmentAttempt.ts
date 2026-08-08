import mongoose from "mongoose";

const AssessmentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
  status: { type: String, enum: ["Draft", "Submitted", "Completed"], default: "Draft" },
  
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentQuestion" },
    matkulId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah" },
    selectedAnswer: String,
    isCorrect: Boolean,
  }],

  matkulResults: [{
    matkulId: { type: mongoose.Schema.Types.ObjectId, ref: "MataKuliah" },
    matkulName: String,
    
    // Audit fields per course
    rawScore: Number,               // Pure score before booster
    adjustedScore: Number,          // Score after booster applied
    finalScore: Number,             // The officially recorded score
    finalGrade: String,             // Letter grade (A, B, C...)
    
    gradingPolicySnapshot: String,  // e.g., "PURE", "SAFETY_NET_50_PLUS_10", "BOOSTER_RANDOM"
    gradeBoosterEnabled: Boolean,   // Was the admin booster toggle ON?
    adjustmentApplied: Number,      // Difference between final and raw
  }],
  
  submittedAt: Date,
  
  // Certificate Fields
  certificateNumber: String,
  certificateIssuedAt: Date,

  // Learning Progress (Pretest & Material Watching)
  learningProgress: {
    type: [{
      materialId: { type: mongoose.Schema.Types.ObjectId },
      isWatched: { type: Boolean, default: false },
      watchedAt: Date,
      pretestSubmittedAt: Date,
      pretestScore: Number,
      isCompleted: { type: Boolean, default: false },
      pretestAnswers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId },
        selectedOption: String,
        isCorrect: Boolean
      }]
    }],
    default: []
  }
}, { timestamps: true });

// Ensure a user can only have one attempt per klaster
AssessmentAttemptSchema.index({ userId: 1, klasterId: 1 }, { unique: true });

export const AssessmentAttempt = mongoose.models.AssessmentAttempt || mongoose.model("AssessmentAttempt", AssessmentAttemptSchema);
