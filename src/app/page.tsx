import Link from "next/link";

export const metadata = {
  title: "REKSA STIMI - RPL STIMI YAPMI Makassar",
  description: "Platform digital Rekognisi Pembelajaran Lampau STIMI YAPMI Makassar",
};

const benefits = [
  {
    title: "Pengalaman Kerja Diakui",
    desc: "Pengalaman profesional, pelatihan, dan pembelajaran sebelumnya dapat menjadi dasar pengajuan rekognisi.",
    mark: "01",
  },
  {
    title: "Masa Studi Lebih Terarah",
    desc: "Mata kuliah yang relevan dapat diajukan untuk dinilai sesuai ketentuan akademik STIMI YAPMI Makassar.",
    mark: "02",
  },
  {
    title: "Proses Dalam Satu Sistem",
    desc: "Pendaftaran, biodata, dokumen, portofolio, asesmen, dan hasil konversi dipantau melalui REKSA.",
    mark: "03",
  },
  {
    title: "Didampingi Tim Akademik",
    desc: "Calon mahasiswa mengikuti tahapan RPL dengan arahan dan verifikasi dari pihak kampus.",
    mark: "04",
  },
  {
    title: "Sesuai untuk Pekerja",
    desc: "Jalur RPL membantu pekerja dan profesional melanjutkan studi tanpa mengabaikan pengalaman yang sudah dimiliki.",
    mark: "05",
  },
  {
    title: "Fokus Bidang Manajemen",
    desc: "STIMI YAPMI Makassar mendukung penguatan kompetensi manajemen melalui proses akademik yang tertib.",
    mark: "06",
  },
];

const registrationSteps = [
  "Buka Periode RPL",
  "Daftar Akun REKSA",
  "Lengkapi Biodata",
  "Unggah Dokumen",
  "Pilih Mata Kuliah RPL (F02)",
  "Isi Portofolio (F03)",
  "Proses Asesmen",
  "Hasil Konversi Akademik",
];

const requirements = [
  "Kartu Tanda Penduduk (KTP)",
  "Kartu Keluarga (KK)",
  "Ijazah Terakhir",
  "Pas Foto Terbaru",
  "CV / Riwayat Hidup",
  "Bukti Pengalaman Kerja",
  "Sertifikat / Pelatihan (jika ada)",
  "Dokumen Pendukung Lainnya",
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link href="/" className="landing-brand" aria-label="REKSA STIMI">
            <span className="landing-logo">R</span>
            <span>
              <strong>REKSA STIMI</strong>
              <small>RPL STIMI YAPMI Makassar</small>
            </span>
          </Link>

          <nav className="landing-menu" aria-label="Navigasi landing page">
            <a href="#tentang">Tentang RPL</a>
            <a href="#manfaat">Manfaat</a>
            <a href="#alur">Alur</a>
            <a href="#syarat">Syarat</a>
          </nav>

          <div className="landing-actions">
            <Link href="/login" className="landing-link-button">Login</Link>
            <Link href="/register" className="landing-button landing-button-primary landing-button-small">Daftar Sekarang</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Jalur Rekognisi Pembelajaran Lampau</p>
            <h1>
              Rekognisi Pembelajaran Lampau
              <span>STIMI YAPMI Makassar</span>
            </h1>
            <p className="landing-lead">
              Pengalaman kerja, pelatihan, dan pembelajaran nonformal Anda dapat diajukan untuk diakui sebagai bagian dari perkuliahan melalui jalur RPL.
            </p>
            <p className="landing-tagline">Pengalaman Diakui, Studi Lebih Terarah.</p>
            <div className="landing-hero-actions">
              <Link href="/register" className="landing-button landing-button-primary">Daftar RPL Sekarang</Link>
              <Link href="/login" className="landing-button landing-button-secondary">Masuk ke REKSA</Link>
            </div>
          </div>

          <div className="landing-hero-panel" aria-label="Ringkasan proses REKSA STIMI">
            <div className="landing-panel-header">
              <span>REKSA STIMI</span>
              <strong>RPL Digital</strong>
            </div>
            <div className="landing-panel-list">
              {["Pendaftaran akun", "Unggah dokumen", "Portofolio RPL", "Asesmen akademik"].map((item, index) => (
                <div key={item} className="landing-panel-row">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="landing-panel-note">
              Pantau tahapan pengajuan RPL secara terintegrasi melalui satu sistem.
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" className="landing-section landing-section-white">
        <div className="landing-container landing-narrow">
          <div className="landing-section-heading">
            <span />
            <h2>Apa itu RPL?</h2>
          </div>
          <div className="landing-info-box">
            RPL atau <strong>Rekognisi Pembelajaran Lampau</strong> adalah proses pengakuan atas capaian pembelajaran seseorang yang diperoleh dari pendidikan formal, nonformal, informal, maupun pengalaman kerja untuk disetarakan dengan capaian pembelajaran mata kuliah tertentu.
          </div>
        </div>
      </section>

      <section id="manfaat" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span />
            <h2>Manfaat RPL</h2>
            <p>Mengapa memilih jalur RPL di STIMI YAPMI Makassar?</p>
          </div>
          <div className="landing-card-grid">
            {benefits.map((item) => (
              <article key={item.mark} className="landing-card">
                <span className="landing-card-mark">{item.mark}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="landing-section landing-section-white">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span />
            <h2>Alur Pendaftaran</h2>
            <p>Langkah-langkah mengikuti program RPL melalui REKSA.</p>
          </div>
          <div className="landing-step-grid">
            {registrationSteps.map((step, index) => (
              <article key={step} className="landing-step">
                <span>{index + 1}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="syarat" className="landing-section landing-section-blue">
        <div className="landing-container landing-narrow">
          <div className="landing-section-heading landing-section-heading-light">
            <span />
            <h2>Syarat Umum</h2>
            <p>Dokumen yang perlu dipersiapkan oleh calon pendaftar.</p>
          </div>
          <div className="landing-requirements">
            {requirements.map((req, index) => (
              <div key={req} className="landing-requirement">
                <span>{index + 1}</span>
                <p>{req}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-white landing-final-cta">
        <div className="landing-container landing-narrow">
          <div className="landing-cta-box">
            <h2>Daftar dan Pantau Proses RPL Melalui REKSA STIMI</h2>
            <p>
              <strong>REKSA STIMI</strong> adalah platform digital Rekognisi Pembelajaran Lampau STIMI YAPMI Makassar untuk pendaftaran, pengisian biodata, unggah dokumen, pengajuan mata kuliah, portofolio, asesmen, dan pemantauan hasil konversi akademik secara terintegrasi.
            </p>
            <div className="landing-hero-actions">
              <Link href="/register" className="landing-button landing-button-primary">Daftar Sekarang</Link>
              <Link href="/login" className="landing-button landing-button-secondary">Login</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <strong>STIMI YAPMI Makassar</strong>
            <p>Rekognisi Pembelajaran Lampau</p>
          </div>
          <div className="landing-footer-brand">
            <span>REKSA</span>
            <small>STIMI</small>
          </div>
        </div>
      </footer>
    </main>
  );
}
