require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

async function debugF03() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.connection.collection("users");
  const AssessmentAttempt = mongoose.connection.collection("assessmentattempts");
  const Klaster = mongoose.connection.collection("klasters");
  const F02 = mongoose.connection.collection("f02pengajuans");
  const KlasterMatkul = mongoose.connection.collection("klastermatkuls");

  const user = await User.findOne({ 
    $or: [
      { username: /iman/i },
      { fullName: /iman/i },
      { name: /iman/i }
    ]
  });

  if (!user) {
    console.log("User iman not found");
    process.exit(0);
  }

  console.log("User found:", user.username, user._id);

  // Check F02
  const f02s = await F02.find({ userId: user._id }).toArray();
  console.log("F02 claims count:", f02s.length);
  
  const matkulIds = f02s.map(f => f.matkulId);
  const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: matkulIds } }).toArray();
  const klasterIds = [...new Set(klasterMatkuls.map(k => k.klasterId.toString()))];
  console.log("Klaster IDs linked to F02:", klasterIds);

  const klasters = await Klaster.find({ _id: { $in: klasterIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
  console.log("Active Klasters for this user:");
  klasters.forEach(k => console.log("- ", k.namaKlaster, k._id.toString(), "isActive:", k.isActive));

  const attempts = await AssessmentAttempt.find({ userId: user._id }).toArray();
  console.log("\nAssessment Attempts for user:");
  attempts.forEach(att => {
    console.log({
      _id: att._id.toString(),
      klasterId: att.klasterId.toString(),
      klasterId_type: typeof att.klasterId,
      klasterId_isObjectId: att.klasterId instanceof mongoose.Types.ObjectId,
      status: att.status,
    });
  });

  process.exit(0);
}

debugF03().catch(console.error);
