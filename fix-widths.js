const fs = require('fs');
const path = 'src/app/(dashboard)/dashboard/mahasiswa/f03/[klasterId]/cetak/F03CetakClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ width="(\d+)%"/g, ' style={{ width: "$1%" }}');
content = content.replace(/ width="(\d+)"/g, ' style={{ width: $1 }}');
content = content.replace(/ rowSpan={2}/g, ' rowSpan={2}'); // Ensure correct JSX
content = content.replace(/ colSpan={3}/g, ' colSpan={3}');
content = content.replace(/ colSpan={4}/g, ' colSpan={4}');
content = content.replace(/ colSpan={2}/g, ' colSpan={2}');

fs.writeFileSync(path, content);
console.log('Done!');
