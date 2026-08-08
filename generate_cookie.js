const session = {
  id: "6a1e5a532cb1a98d9df397e1",
  name: "Iman Prasetyo Amir",
  username: "iman",
  role: "mahasiswa"
};
const raw = Buffer.from(JSON.stringify(session)).toString("base64url");
console.log(`Cookie: session=${raw}`);
