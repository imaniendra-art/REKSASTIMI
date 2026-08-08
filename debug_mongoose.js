require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const { AssessmentAttempt } = require("./src/models/AssessmentAttempt");

async function testQuery() {
  await mongoose.connect(process.env.MONGODB_URI);

  const userIdStr = "6a1e5a532cb1a98d9df397e1"; // iman
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

  console.log("Querying with string session.id...");
  try {
    const attempts = await AssessmentAttempt.find({ 
      userId: userIdStr,
      klasterId: { $in: klasterIds }
    }).lean();
    console.log("Found attempts count:", attempts.length);
  } catch (e) {
    console.error("Error:", e);
  }
  
  process.exit(0);
}

testQuery();
