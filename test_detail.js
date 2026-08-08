async function testDetailApi() {
  const cookie = "reksa_session=eyJpZCI6IjZhMWU1YTUzMmNiMWE5OGQ5ZGYzOTdlMSIsIm5hbWUiOiJJbWFuIFByYXNldHlvIEFtaXIiLCJ1c2VybmFtZSI6ImltYW4iLCJyb2xlIjoibWFoYXNpc3dhIn0";
  try {
    const res = await fetch("http://localhost:3030/api/mahasiswa/f03/6a1f096f7579b138902ba1bf", {
      headers: { Cookie: cookie }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testDetailApi();
