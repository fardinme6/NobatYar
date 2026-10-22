-- REVIEW BEFORE RUNNING. Run once on production ONLY after a Neon backup.
-- Adds the 3 original display cards to real database tables, without changing existing rows.
-- No DELETE, UPDATE, or DROP statements.
BEGIN;
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM hospitals),'hospitalOne','governmentHospital','government','herat','herat','hospitalAddressOne','/Hospitals/herathospital.jpg','hospitalDescriptionOne'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalOne');
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM hospitals),'hospitalTwo','privateHospital','private','herat','herat','hospitalAddressTwo','/Hospitals/habibyarhospital.jpg','hospitalDescriptionTwo'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalTwo');
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM hospitals),'hospitalThree','privateHospital','private','herat','herat','hospitalAddressThree','/Hospitals/qalbherathospital.jpeg','hospitalDescriptionThree'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalThree');

INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM doctors),'doctorOne','cardiologist','cardiology','hospitalThree','herat','herat','/Doctors/ab.khaliqmonib.JPG','','',''
WHERE EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalThree')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name='doctorOne');
INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM doctors),'doctorTwo','dermatologist','dermatology','hospitalOne','herat','herat','/Doctors/manocher.jpg','','',''
WHERE EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalOne')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name='doctorTwo');
INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT (SELECT COALESCE(MAX(id),0)+1 FROM doctors),'doctorThree','neurologist','neurology','hospitalOne','herat','herat','/Doctors/qadimmohammadi.jpg','','',''
WHERE EXISTS (SELECT 1 FROM hospitals WHERE name='hospitalOne')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name='doctorThree');

-- Default hours only for newly recognized original sample doctors; never overwrite existing schedules.
INSERT INTO doctor_schedules (doctor_id,weekday,start_time,end_time,slot_minutes,capacity,enabled)
SELECT d.id,w.weekday,'09:00','16:00',30,1,true
FROM doctors d CROSS JOIN (VALUES(0),(1),(2),(3),(4),(6)) AS w(weekday)
WHERE d.name IN ('doctorOne','doctorTwo','doctorThree')
ON CONFLICT (doctor_id,weekday) DO NOTHING;
COMMIT;

-- Check after running:
-- SELECT id,name,image FROM doctors ORDER BY id;
-- SELECT id,name,image FROM hospitals ORDER BY id;
