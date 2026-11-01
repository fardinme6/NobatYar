-- Run once in Neon SQL Editor before deploying this update.
CREATE TABLE IF NOT EXISTS doctor_hospitals (
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, hospital_id)
);

-- Preserve existing doctor-to-hospital relationships.
INSERT INTO doctor_hospitals (doctor_id, hospital_id)
SELECT d.id, h.id FROM doctors d JOIN hospitals h ON h.name = d.hospital
ON CONFLICT DO NOTHING;
