

async function test() {
  const klasterId = "672df9b7754b207593c20c02"; // ID of Digital Business & Technology
  
  // Fetch current
  const res = await fetch(`http://localhost:3000/api/admin/asesmen/${klasterId}`, {
    headers: {
      "Cookie": "admin_session=reksa_secure_admin_2024"
    }
  });
  const data = await res.json();
  console.log("Current materials count:", data.data.learningMaterials.length);
  
  // Let's remove the last material
  const materials = data.data.learningMaterials;
  if (materials.length > 0) {
    materials.pop();
  }
  
  const patchRes = await fetch(`http://localhost:3000/api/admin/asesmen/${klasterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "admin_session=reksa_secure_admin_2024"
    },
    body: JSON.stringify({
      learningMaterials: materials
    })
  });
  
  const patchData = await patchRes.json();
  console.log("Patch response:", patchRes.status, patchData);
  
  // Fetch again
  const res2 = await fetch(`http://localhost:3000/api/admin/asesmen/${klasterId}`, {
    headers: {
      "Cookie": "admin_session=reksa_secure_admin_2024"
    }
  });
  const data2 = await res2.json();
  console.log("New materials count:", data2.data.learningMaterials.length);
}

test();
