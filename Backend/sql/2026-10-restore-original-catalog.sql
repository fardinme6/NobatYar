BEGIN;
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT COALESCE((SELECT MAX(id) FROM hospitals),0)+1,'hospitalOne','government','government','herat','herat','hospitalAddressOne','/Hospitals/herathospital.jpg','hospitalDescriptionOne'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name IN ('hospitalOne','Herat 770-Bed Regional Hospital'));
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT COALESCE((SELECT MAX(id) FROM hospitals),0)+1,'hospitalTwo','private','private','herat','herat','hospitalAddressTwo','/Hospitals/habibyarhospital.jpg','hospitalDescriptionTwo'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name IN ('hospitalTwo','Habib Yar Complex Hospital'));
INSERT INTO hospitals (id,name,type,type_value,city,city_value,location,image,description)
SELECT COALESCE((SELECT MAX(id) FROM hospitals),0)+1,'hospitalThree','private','private','herat','herat','hospitalAddressThree','/Hospitals/qalbherathospital.jpeg','hospitalDescriptionThree'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name IN ('hospitalThree','Herat Heart Hospital'));
INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT COALESCE((SELECT MAX(id) FROM doctors),0)+1,'doctorOne','cardiologist','cardiology',h.name,'herat','herat','/Doctors/ab.khaliqmonib.JPG','','',''
FROM hospitals h WHERE h.name IN ('hospitalThree','Herat Heart Hospital')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name IN ('doctorOne','Dr. Abdul Khaliq Monib'))
LIMIT 1;
INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT COALESCE((SELECT MAX(id) FROM doctors),0)+1,'doctorTwo','dermatologist','dermatology',h.name,'herat','herat','/Doctors/manocher.jpg','','',''
FROM hospitals h WHERE h.name IN ('hospitalOne','Herat 770-Bed Regional Hospital')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name IN ('doctorTwo','Dr. Manocher Motahari'))
LIMIT 1;
INSERT INTO doctors (id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about)
SELECT COALESCE((SELECT MAX(id) FROM doctors),0)+1,'doctorThree','neurologist','neurology',h.name,'herat','herat','/Doctors/qadimmohammadi.jpg','','',''
FROM hospitals h WHERE h.name IN ('hospitalOne','Herat 770-Bed Regional Hospital')
AND NOT EXISTS (SELECT 1 FROM doctors WHERE name IN ('doctorThree','Dr. Qadim Mohammadi'))
LIMIT 1;
COMMIT;
