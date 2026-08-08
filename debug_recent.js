require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

async function checkRecent() {
  await mongoose.connect(process.env.MONGODB_URI);
  const AssessmentAttempt = mongoose.connection.collection("assessmentattempts");
  
  const attempts = await AssessmentAttempt.find({}).sort({ _id: -1 }).limit(10).toArray();
  
  console.log("Recent attempts:");
  attempts.forEach(att => {
    console.log({
      _id: att._id.toString(),
      status: att.status,
      userId: att.userId.toString(),
      klasterId: att.klasterId.toString(),
      certificate: att.certificateNumber
    });
  });

  const F03Evaluasi = mongoose.connection.collection("f03evaluasis");
  const f03s = await F03Evaluasi.find({}).sort({ _id: -1 }).limit(5).toArray();
  console.log("\nRecent F03s:");
  f03s.forEach(f => {
    console.log({
      _id: f._id.toString(),
      userId: f.userId.toString(),
      klasterId: f.klasterId.toString(),
      isSubmitted: f.isSubmitted
    });
  });

  const F02 = mongoose.connection.collection("f02pengajuans");
  const f02s = await F02.find({}).sort({ _id: -1 }).limit(5).toArray();
  console.log("\nRecent F02s:");
  f02s.forEach(f => {
    console.log({
      _id: f._id.toString(),
      userId: f.userId.toString(),
      matkulId: f.matkulId.toString()
    });
  });

  process.exit(0);
}

checkRecent();
