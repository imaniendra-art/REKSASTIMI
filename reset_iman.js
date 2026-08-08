const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').trim();

mongoose.connect(MONGODB_URI).then(async () => {
  const users = await mongoose.connection.collection('users').find({ $or: [{ name: /iman/i }, { username: /iman/i }] }).toArray();
  if (users.length === 0) {
    console.log("No user found with name/username 'iman'");
  } else {
    for (const u of users) {
      console.log("Found user:", u.username, u.name);
      // delete assessment attempts
      const res = await mongoose.connection.collection('assessmentattempts').deleteMany({ studentId: u._id });
      console.log(`Deleted ${res.deletedCount} attempts for studentId ${u._id}`);
      
      // also check by userId if it's there
      const res2 = await mongoose.connection.collection('assessmentattempts').deleteMany({ userId: u._id });
      if (res2.deletedCount > 0) {
         console.log(`Deleted ${res2.deletedCount} attempts for userId ${u._id}`);
      }
    }
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
