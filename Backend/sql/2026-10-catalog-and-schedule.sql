-- Run in Neon production only after confirming the existing catalog.
-- Adds the original demo catalog only if the corresponding tables are empty.
-- Does not delete or overwrite any existing record.
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM hospitals) THEN
  INSERT INTO hospitals(id,name,type,type_value,city,city_value,location,image,description) VALUES
  (1,'Herat 770-Bed Regional Hospital','Government Hospital','government','Herat','herat','Herat','/Hospitals/herathospital.jpg',''),
  (2,'Habib Yar Complex Hospital','Private Hospital','private','Herat','herat','Herat','/Hospitals/habibyarhospital.jpg',''),
  (3,'Herat Heart Hospital','Private Hospital','private','Herat','herat','Herat','/Hospitals/qalbherathospital.jpeg','');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM doctors) AND EXISTS(SELECT 1 FROM hospitals WHERE id=1) AND EXISTS(SELECT 1 FROM hospitals WHERE id=3) THEN
  INSERT INTO doctors(id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about) VALUES
  (1,'Dr. Abdul Khaliq Monib','cardiology','cardiology','Herat Heart Hospital','Herat','herat','/Doctors/ab.khaliqmonib.JPG','','',''),
  (2,'Dr. Manocher Motahari','dermatology','dermatology','Herat 770-Bed Regional Hospital','Herat','herat','/Doctors/manocher.jpg','','',''),
  (3,'Dr. Qadim Mohammadi','neurology','neurology','Herat 770-Bed Regional Hospital','Herat','herat','/Doctors/qadimmohammadi.jpg','','','');
 END IF;
END $$;
-- Sample working hours for doctors without any schedule yet.
-- Providers can change/disable each day later in their dashboard.
INSERT INTO doctor_schedules(doctor_id,weekday,start_time,end_time,slot_minutes,enabled)
SELECT d.id,w.day,'08:00','17:00',30,true FROM doctors d CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) w(day)
WHERE NOT EXISTS(SELECT 1 FROM doctor_schedules ds WHERE ds.doctor_id=d.id)
ON CONFLICT (doctor_id,weekday) DO NOTHING;
