import json

with open("siresti_full_lms.json", "r") as f:
    data = json.load(f)

for klaster_id, k_data in data.items():
    for q in k_data["questions"]:
        if q["kode_matkul"] in ["MNJ.101", "MNJ.203", "MNJ.302", "MNJ.408"] or (q["nama_matkul"] and "Ekonomi" in q["nama_matkul"]):
            print(f"Found {q['kode_matkul']} {q['nama_matkul']} in SIRESTI klaster: {k_data['nama_cluster']} (ID {klaster_id})")
            print(f"Question: {q['pertanyaan']}")
