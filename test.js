const mongoose = require('mongoose');

const dbUrl = 'mongodb://reksa_stimi:makassar123@ac-8xozqn6-shard-00-00.scrppww.mongodb.net:27017,ac-8xozqn6-shard-00-01.scrppww.mongodb.net:27017,ac-8xozqn6-shard-00-02.scrppww.mongodb.net:27017/reksa_stimi?ssl=true&replicaSet=atlas-8b9m3k-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(dbUrl);
  
  const user = await mongoose.connection.db.collection('users').findOne({ name: "Iman Prasetyo Amir" });
  console.log("User ID:", user._id);
  const profile = await mongoose.connection.db.collection('applicantprofiles').findOne({ userId: user._id });
  console.log("Profile userId:", profile.userId);
  console.log("Documents:", JSON.stringify(profile.documents, null, 2));
  
  process.exit(0);
}
run();
