import sqlite3
import json

db_path = "G:/IMANIENDRA GD/STIMI YAPMI/PUSDATIN/SIRESTI/siresti.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

data = {}

cursor.execute("SELECT * FROM clusters")
clusters = [dict(row) for row in cursor.fetchall()]

for c in clusters:
    klaster_id = c['id']
    klaster_name = c['nama_cluster']
    
    cursor.execute("SELECT * FROM lms_modul WHERE klaster_id = ?", (klaster_id,))
    modul = cursor.fetchone()
    modul_data = dict(modul) if modul else None

    cursor.execute("""
        SELECT s.*, m.kode as kode_matkul, m.nama as nama_matkul 
        FROM lms_soal s
        LEFT JOIN mata_kuliah m ON s.matkul_id = m.id
        WHERE s.klaster_id = ?
    """, (klaster_id,))
    questions = [dict(row) for row in cursor.fetchall()]

    data[str(klaster_id)] = {
        "nama_cluster": klaster_name,
        "modul": modul_data,
        "questions": questions
    }

conn.close()

with open("siresti_full_lms.json", "w") as f:
    json.dump(data, f, indent=2)

print("Exported full LMS data to siresti_full_lms.json")
