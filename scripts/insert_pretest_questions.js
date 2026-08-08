const mongoose = require('mongoose');
const fs = require('fs');

// Read .env
const envContent = fs.readFileSync('.env', 'utf-8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoLine.replace('MONGODB_URI=', '').replace(/"/g, '').trim();

mongoose.connect(MONGODB_URI).then(async () => {
  const klasterId = new mongoose.Types.ObjectId("6a1f09707579b138902ba1c3");

  // Attempt to find the course "Literasi Teknologi Komputer"
  const matkul = await mongoose.connection.collection('matakuliahs').findOne({ namaMatkul: /Literasi Teknologi Komputer/i });
  let courseId = null;
  if (matkul) {
    courseId = matkul._id;
    console.log(`Found course: ${matkul.namaMatkul} with ID ${courseId}`);
  } else {
    console.log("Course 'Literasi Teknologi Komputer' not found. Questions will be unlinked (umum).");
  }

  // Define questions
  const questions = [
    {
      klaster: klasterId,
      course: courseId,
      type: "MULTIPLE_CHOICE",
      questionText: "Apa yang dimaksud dengan komputasi awan (Cloud Computing) dalam konteks bisnis digital?",
      options: [
        { label: "A", text: "Penyimpanan data di perangkat keras komputer lokal." },
        { label: "B", text: "Layanan penyediaan sumber daya komputasi melalui internet." },
        { label: "C", text: "Jaringan kabel bawah laut yang menghubungkan server." },
        { label: "D", text: "Perangkat lunak antivirus untuk melindungi data perusahaan." }
      ],
      correctAnswer: "B",
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      klaster: klasterId,
      course: courseId,
      type: "MULTIPLE_CHOICE",
      questionText: "Manakah dari berikut ini yang BUKAN merupakan keuntungan utama dari transformasi digital bagi suatu perusahaan?",
      options: [
        { label: "A", text: "Peningkatan efisiensi operasional." },
        { label: "B", text: "Penurunan jangkauan pasar." },
        { label: "C", text: "Pengambilan keputusan berbasis data." },
        { label: "D", text: "Peningkatan pengalaman pelanggan." }
      ],
      correctAnswer: "B",
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      klaster: klasterId,
      course: courseId,
      type: "MULTIPLE_CHOICE",
      questionText: "Dalam model bisnis E-commerce, apa yang membedakan B2B (Business-to-Business) dengan B2C (Business-to-Consumer)?",
      options: [
        { label: "A", text: "B2B menjual produk fisik, B2C menjual layanan digital." },
        { label: "B", text: "B2B terjadi antara dua perusahaan, B2C terjadi antara perusahaan dan konsumen akhir." },
        { label: "C", text: "B2B menggunakan mata uang kripto, B2C menggunakan uang fiat." },
        { label: "D", text: "B2B hanya ada di platform media sosial, B2C ada di website mandiri." }
      ],
      correctAnswer: "B",
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      klaster: klasterId,
      course: courseId,
      type: "MULTIPLE_CHOICE",
      questionText: "Apa fungsi utama dari sistem CRM (Customer Relationship Management) dalam bisnis teknologi?",
      options: [
        { label: "A", text: "Mengelola dan menganalisis interaksi data pelanggan di seluruh siklus hidup pelanggan." },
        { label: "B", text: "Membuat desain grafis untuk kampanye pemasaran digital." },
        { label: "C", text: "Mengatur sistem pendingin pada pusat data (data center) perusahaan." },
        { label: "D", text: "Memprogram algoritma kecerdasan buatan (AI) dari awal." }
      ],
      correctAnswer: "A",
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      klaster: klasterId,
      course: courseId,
      type: "MULTIPLE_CHOICE",
      questionText: "Istilah 'Big Data' merujuk pada...",
      options: [
        { label: "A", text: "Komputer berukuran besar yang digunakan pada tahun 1960-an." },
        { label: "B", text: "Kapasitas penyimpanan flashdisk terbaru yang lebih dari 1 Terabyte." },
        { label: "C", text: "Himpunan data yang sangat besar, kompleks, dan cepat pertumbuhannya yang sulit diproses oleh alat manajemen data tradisional." },
        { label: "D", text: "Virus komputer yang dapat menghapus seluruh data pada hard drive." }
      ],
      correctAnswer: "C",
      order: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Remove course field if it is null so it falls back to common logic
  questions.forEach(q => {
    if (!q.course) delete q.course;
  });

  const result = await mongoose.connection.collection('assessmentquestions').insertMany(questions);
  console.log(`Inserted ${result.insertedCount} questions successfully!`);
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
