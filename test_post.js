const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').trim();

mongoose.connect(MONGODB_URI).then(async () => {
  const Klaster = mongoose.connection.collection('klasters');
  const AssessmentAttempt = mongoose.connection.collection('assessmentattempts');
  
  const klasterId = '6a1f09707579b138902ba1c3'; // Digital Business
  const userId = new mongoose.Types.ObjectId('6a1e5a532cb1a98d9df397e1'); // Iman
  
  const klaster = await Klaster.findOne({ _id: new mongoose.Types.ObjectId(klasterId) });
  const materialId = klaster.learningMaterials[0]._id.toString(); 
  console.log('Material ID from DB:', materialId);
  
  const material = klaster.learningMaterials.find(m => m._id.toString() === materialId);
  if (!material) {
    console.log("MATERIAL NOT FOUND IN DB KLASTER");
    process.exit(1);
  }
  
  let attempt = await AssessmentAttempt.findOne({ userId: userId, klasterId: new mongoose.Types.ObjectId(klasterId) });
  if (!attempt) {
    console.log("CREATING NEW ATTEMPT DRAFT");
    attempt = {
      userId: userId,
      klasterId: new mongoose.Types.ObjectId(klasterId),
      status: 'Draft',
      learningProgress: []
    };
    await AssessmentAttempt.insertOne(attempt);
    attempt = await AssessmentAttempt.findOne({ userId: userId, klasterId: new mongoose.Types.ObjectId(klasterId) });
  }
  
  const progressIndex = attempt.learningProgress.findIndex(p => p.materialId && p.materialId.toString() === materialId);
  
  const progressData = {
    materialId: new mongoose.Types.ObjectId(materialId),
    isWatched: true,
    watchedAt: new Date(),
    pretestScore: 0,
    isCompleted: false,
    pretestAnswers: []
  };
  
  if (progressIndex > -1) {
    attempt.learningProgress[progressIndex] = { ...attempt.learningProgress[progressIndex], ...progressData };
  } else {
    attempt.learningProgress.push(progressData);
  }
  
  try {
    const res = await AssessmentAttempt.updateOne({ _id: attempt._id }, { $set: { learningProgress: attempt.learningProgress } });
    console.log("UPDATE SUCCESS:", res.modifiedCount);
  } catch(e) {
    console.error("UPDATE ERROR:", e);
  }
  
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
