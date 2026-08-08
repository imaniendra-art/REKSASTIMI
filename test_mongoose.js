const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').trim();

const AssessmentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  klasterId: { type: mongoose.Schema.Types.ObjectId, ref: "Klaster", required: true },
  status: { type: String, enum: ["Draft", "Submitted", "Completed"], default: "Draft" },
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
});
const AssessmentAttempt = mongoose.model("AssessmentAttempt", AssessmentAttemptSchema);

mongoose.connect(MONGODB_URI).then(async () => {
  const klasterId = '6a1f09707579b138902ba1c3'; // Digital Business
  const userId = '6a1e5a532cb1a98d9df397e1'; // Iman
  const materialId = '6a29682743cf2dae35bd46a4'; // String id

  let attempt = await AssessmentAttempt.findOne({ userId, klasterId });
  if (!attempt) {
    attempt = new AssessmentAttempt({
      userId,
      klasterId,
      status: 'Draft',
      learningProgress: []
    });
  }

  const progressData = {
    materialId: materialId, // Assigning string to ObjectId field!
    isWatched: true,
    watchedAt: new Date(),
    isCompleted: false,
    pretestAnswers: []
  };

  attempt.learningProgress.push(progressData);

  try {
    await attempt.save();
    console.log("SAVE SUCCESS");
  } catch(e) {
    console.error("SAVE ERROR:", e);
  }
  
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
