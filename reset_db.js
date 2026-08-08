const mongoose = require('mongoose');
const fs = require('fs');

// Read .env
const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
// Strip MONGODB_URI= and \r
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').trim();

mongoose.connect(MONGODB_URI).then(async () => {
  const users = await mongoose.connection.collection('users').find({ role: 'mahasiswa', username: 'iman' }).toArray();
  if (users.length === 0) {
    console.log("User not found");
    process.exit(1);
  }
  const userId = users[0]._id;
  console.log('User found:', users[0].name);

  const klasters = await mongoose.connection.collection('klasters').find({}).toArray();
  const klaster = klasters.find(k => k.namaKlaster.includes('Keuangan') || k.namaKlaster.includes('Manajemen') || k.namaKlaster.includes('Asesmen'));
  const klasterId = klaster ? klaster._id : klasters[0]._id;
  console.log('Target Klaster:', klaster ? klaster.namaKlaster : klasters[0].namaKlaster);

  // 1. Delete attempts for Iman
  const delRes = await mongoose.connection.collection('assessmentattempts').deleteMany({ userId: userId });
  console.log('Deleted assessment attempts:', delRes.deletedCount);
  
  const delNilai = await mongoose.connection.collection('nilaifinals').deleteMany({ userId: userId });
  console.log('Deleted nilai final:', delNilai.deletedCount);

  // 2. Fetch matkuls for this klaster
  const klasterMatkuls = await mongoose.connection.collection('klastermatkuls').find({ klasterId: klasterId }).toArray();
  const matkulIds = klasterMatkuls.map(km => km.matkulId);
  const matkuls = await mongoose.connection.collection('matakuliahs').find({ _id: { $in: matkulIds } }).toArray();
  console.log(`Found ${matkuls.length} matkuls for this klaster.`);

  // 3. Create learning materials
  const newMaterials = matkuls.map((m, idx) => ({
    _id: new mongoose.Types.ObjectId(),
    title: 'Pengantar ' + m.namaMatkul,
    description: 'Ini adalah materi pengantar wajib untuk mata kuliah ' + m.namaMatkul + ' sebelum mengikuti ujian akhir.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pdfUrl: '',
    courseId: m._id.toString(),
    courseName: m.namaMatkul,
    order: idx + 1,
    isActive: true,
    pretestQuestions: [
      {
        _id: new mongoose.Types.ObjectId(),
        questionText: 'Apa pemahaman awal Anda tentang ' + m.namaMatkul + ' berdasarkan video di atas?',
        options: [
          { label: 'A', text: 'Kurang Relevan' },
          { label: 'B', text: 'Tidak ada jawaban' },
          { label: 'C', text: 'Penting dipahami (Kunci Jawaban)' },
          { label: 'D', text: 'Biasa saja' }
        ],
        correctAnswer: 'C',
        score: 10,
        order: 1,
        isActive: true
      }
    ]
  }));

  const updateRes = await mongoose.connection.collection('klasters').updateOne(
    { _id: klasterId },
    { $set: { learningMaterials: newMaterials } }
  );
  console.log('Updated klaster with learning materials:', updateRes.modifiedCount);

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
