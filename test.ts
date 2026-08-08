import mongoose from 'mongoose';
import { ApplicantProfile } from './src/models/ApplicantProfile';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const p = await ApplicantProfile.findOne();
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
run();
