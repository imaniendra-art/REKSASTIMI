require('dotenv').config();
const mongoose = require('mongoose');
const { F02Pengajuan } = require('./src/models/F02Pengajuan');
const { KlasterMatkul } = require('./src/models/KlasterMatkul');
const { F03Evaluasi } = require('./src/models/F03Evaluasi');
const { User } = require('./src/models/User');
const { ApplicantProfile } = require('./src/models/ApplicantProfile');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ name: /Iman/i });
  console.log("User:", user?.name, user?._id);

  if (!user) {
    console.log("User not found");
    process.exit();
  }
  const userId = user._id.toString();
  
  const profile = await ApplicantProfile.findOne({ userId });
  console.log("Profile statusRpl:", profile?.statusRpl);

  const f02Claims = await F02Pengajuan.find({ userId });
  const claimedMatkulIds = f02Claims.map(c => c.matkulId?.toString()).filter(Boolean);
  console.log("Claimed matkuls count:", claimedMatkulIds.length);

  const klasterMatkuls = await KlasterMatkul.find({ matkulId: { $in: claimedMatkulIds } });
  const klasterIds = [...new Set(klasterMatkuls.map(km => km.klasterId?.toString()).filter(Boolean))];
  console.log("Klaster IDs:", klasterIds);

  let allSubmitted = true;

  for (const klasterId of klasterIds) {
    const kms = await KlasterMatkul.find({ klasterId });
    const validMatkulIds = kms
      .filter(km => claimedMatkulIds.includes(km.matkulId?.toString()))
      .map(km => km.matkulId?.toString());
    console.log(`Klaster ${klasterId} valid claimed matkuls count:`, validMatkulIds.length);

    // check f03
    const submitted = await F03Evaluasi.countDocuments({
      userId,
      klasterId,
      courseId: { $in: validMatkulIds },
      isSubmitted: true
    });
    
    console.log(`Klaster ${klasterId} submitted F03s:`, submitted);
    if (submitted < validMatkulIds.length) {
      allSubmitted = false;
    }
  }

  console.log("allSubmitted:", allSubmitted);

  process.exit();
}
test().catch(console.error);
