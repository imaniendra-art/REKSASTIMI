require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const { connectMongoDB } = require("./src/lib/mongodb");
const { AssessmentAttempt } = require("./src/models/AssessmentAttempt");
const { F02Pengajuan } = require("./src/models/F02Pengajuan");

async function simulate() {
  await connectMongoDB();
  const sessionId = "6a1e5a532cb1a98d9df397e1"; // iman's id
  
  const f02Claims = await F02Pengajuan.find({ userId: sessionId }).lean();
  console.log("F02 Claims count:", f02Claims.length);
  
  const klasterIds = [
    '6a1f096f7579b138902ba1c1',
    '6a1f09707579b138902ba1c5',
    '6a1f09707579b138902ba1c3',
    '6a1f096f7579b138902ba1bf',
    '6a1f09707579b138902ba1cb',
    '6a1f09707579b138902ba1c7',
    '6a1f09707579b138902ba1cd',
    '6a1f09707579b138902ba1c9'
  ];
  
  const attempts = await AssessmentAttempt.find({ 
    userId: sessionId,
    klasterId: { $in: klasterIds }
  }).lean();
  
  console.log("Attempts found with Mongoose:", attempts.length);
  
  if (attempts.length > 0) {
    console.log("Sample attempt:", {
      status: attempts[0].status,
      certificateNumber: attempts[0].certificateNumber,
      isCompleted: attempts[0].isCompleted,
    });
  }

  process.exit(0);
}

simulate().catch(console.error);
