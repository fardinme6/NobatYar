CREATE TABLE IF NOT EXISTS medical_specialties (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 value TEXT NOT NULL UNIQUE
);
INSERT INTO medical_specialties(name,value) VALUES('cardiology','cardiology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('neurology','neurology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('pediatrics','pediatrics') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('ophthalmology','ophthalmology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('dermatology','dermatology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('orthopedics','orthopedics') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('dentistry','dentistry') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('gastroenterology','gastroenterology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('gynecology','gynecology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('ent','ent') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('urology','urology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('pulmonology','pulmonology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('nephrology','nephrology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('endocrinology','endocrinology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('generalSurgery','generalSurgery') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('psychiatry','psychiatry') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('oncology','oncology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('hematology','hematology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('rheumatology','rheumatology') ON CONFLICT(value) DO NOTHING;
INSERT INTO medical_specialties(name,value) VALUES('generalMedicine','generalMedicine') ON CONFLICT(value) DO NOTHING;
