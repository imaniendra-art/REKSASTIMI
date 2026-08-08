const fs = require('fs');
const path = 'src/app/(dashboard)/dashboard/mahasiswa/f03/[klasterId]/cetak/F03CetakClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/style=\{\{\s*([^}]+)\s*\}\}\s*style=\{\{\s*([^}]+)\s*\}\}/g, 'style={{ $1, $2 }}');

fs.writeFileSync(path, content);
console.log('Done merging styles!');
