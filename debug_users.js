require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.connection.collection("users");
  const users = await User.find({ 
    $or: [
      { username: /iman/i },
      { fullName: /iman/i },
      { name: /iman/i }
    ]
  }).toArray();
  
  console.log("Users found:", users.length);
  users.forEach(u => console.log(u.username, u.name, u._id.toString()));
  process.exit(0);
}

checkUsers();
