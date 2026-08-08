const mongoose = require('mongoose');
const fs = require('fs');

// Read .env
const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').trim();

// Map matkul name to a sample youtube video
const getYoutubeUrl = (matkulName) => {
  const name = matkulName.toLowerCase();
  if (name.includes('e-commerce') || name.includes('bisnis digital')) return 'https://www.youtube.com/embed/zH0uM2w8_8M';
  if (name.includes('data') || name.includes('analitik')) return 'https://www.youtube.com/embed/bLbqT0q229o';
  if (name.includes('sistem informasi') || name.includes('manajemen informasi')) return 'https://www.youtube.com/embed/S2d9zO-cMRE';
  if (name.includes('digital marketing') || name.includes('pemasaran digital')) return 'https://www.youtube.com/embed/bixR-KIJKYM';
  if (name.includes('startup') || name.includes('kewirausahaan')) return 'https://www.youtube.com/embed/k9wK2FcwL9c';
  
  // Default general digital business video
  return 'https://www.youtube.com/embed/LqmqHqQpZxE';
};

mongoose.connect(MONGODB_URI).then(async () => {
  const klasters = await mongoose.connection.collection('klasters').find({}).toArray();
  const klaster = klasters.find(k => k.namaKlaster.includes('Digital Business') || k.namaKlaster.includes('Technology'));
  if (!klaster) {
    console.log("Klaster Digital Business & Technology tidak ditemukan");
    process.exit(1);
  }
  const klasterId = klaster._id;
  console.log('Target Klaster:', klaster.namaKlaster);

  // 1. Fetch matkuls for this klaster
  const klasterMatkuls = await mongoose.connection.collection('klastermatkuls').find({ klasterId: klasterId }).toArray();
  const matkulIds = klasterMatkuls.map(km => km.matkulId);
  const matkuls = await mongoose.connection.collection('matakuliahs').find({ _id: { $in: matkulIds } }).toArray();
  console.log(`Found ${matkuls.length} matkuls for this klaster.`);

  // 2. Fetch assessment questions for this klaster
  const allQuestions = await mongoose.connection.collection('assessmentquestions').find({ klaster: klasterId }).toArray();

  // 3. Create learning materials
  const newMaterials = matkuls.map((m, idx) => {
    // Find questions for this matkul
    const matkulQuestions = allQuestions.filter(q => q.course && q.course.toString() === m._id.toString());
    
    const pretestQuestions = matkulQuestions.map((q, qIdx) => ({
      _id: new mongoose.Types.ObjectId(),
      questionText: q.questionText,
      options: [
        { label: 'A', text: q.optionA },
        { label: 'B', text: q.optionB },
        { label: 'C', text: q.optionC },
        { label: 'D', text: q.optionD }
      ],
      correctAnswer: q.correctOption || 'A', // some old schema might use correctOption
      score: 10,
      order: qIdx + 1,
      isActive: true
    }));

    // if old schema doesn't use correctOption, maybe it uses correctAnswer
    pretestQuestions.forEach((pq, i) => {
      const q = matkulQuestions[i];
      if (!q.correctOption && q.correctAnswer) pq.correctAnswer = q.correctAnswer;
    });

    return {
      _id: new mongoose.Types.ObjectId(),
      title: 'Materi ' + m.namaMatkul,
      description: 'Pelajari video berikut mengenai ' + m.namaMatkul + ' sebelum mengikuti ujian akhir.',
      videoUrl: getYoutubeUrl(m.namaMatkul),
      pdfUrl: '',
      courseId: m._id.toString(),
      courseName: m.namaMatkul,
      order: idx + 1,
      isActive: true,
      pretestQuestions: pretestQuestions
    };
  });

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
