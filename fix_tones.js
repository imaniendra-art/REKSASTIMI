const fs = require('fs');
const path = require('path');

const replacements = [
  { file: "src/app/(dashboard)/dashboard/mahasiswa/biodata/page.tsx", old: 'tone="info"', new: 'tone="primary"' },
  { file: "src/app/(dashboard)/dashboard/mahasiswa/cv/page.tsx", old: 'tone="dark"', new: 'tone="warning"' },
  { file: "src/app/(dashboard)/dashboard/mahasiswa/keuangan/page.tsx", old: 'tone="success"', new: 'tone="danger"' },
  { file: "src/app/(dashboard)/dashboard/mahasiswa/f02/page.tsx", old: 'tone="warning"', new: 'tone="success"' },
  { file: "src/app/(dashboard)/dashboard/mahasiswa/asesmen/AsesmenListClient.tsx", old: 'tone="maroon"', new: 'tone="info"' }
];

replacements.forEach(r => {
  const filePath = path.join(process.cwd(), r.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(r.old, r.new);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${r.file}`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
});
