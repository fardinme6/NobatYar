import 'dotenv/config';
import fs from 'node:fs/promises';
import { db } from '../src/db.js';
const hospitals = [
 [1,'hospitalOne','governmentHospital','government','herat','herat','hospitalAddressOne','/Hospitals/herathospital.jpg','hospitalDescriptionOne'],
 [2,'hospitalTwo','privateHospital','private','herat','herat','hospitalAddressTwo','/Hospitals/habibyarhospital.jpg','hospitalDescriptionTwo'],
 [3,'hospitalThree','privateHospital','private','herat','herat','hospitalAddressThree','/Hospitals/qalbherathospital.jpeg','hospitalDescriptionThree']
];
const doctors = [
 [1,'doctorOne','cardiologist','cardiology','hospitalThree','herat','herat','/Doctors/ab.khaliqmonib.JPG','','',''],
 [2,'doctorTwo','dermatologist','dermatology','hospitalOne','herat','herat','/Doctors/manocher.jpg','','',''],
 [3,'doctorThree','neurologist','neurology','hospitalOne','herat','herat','/Doctors/qadimmohammadi.jpg','','','']
];
try {
 await db.query(await fs.readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
 for (const h of hospitals) await db.query('INSERT INTO hospitals(id,name,type,type_value,city,city_value,location,image,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING', h);
 for (const d of doctors) await db.query('INSERT INTO doctors(id,name,specialty,specialty_value,hospital,city,city_value,image,experience,education,about) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO NOTHING', d);
 console.log('Database initialized with original NobatYar doctors and hospitals');
} finally { await db.end(); }
