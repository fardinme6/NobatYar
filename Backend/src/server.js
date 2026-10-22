import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { uploadAvatarToCloudinary, deleteCloudinaryAvatar, cloudinaryEnabled, uploadProviderPhotoToCloudinary, uploadSpecialtyImageToCloudinary } from './cloudinary.js';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { sendAccountEmail } from './mail.js';
import { z } from 'zod';
import { db } from './db.js';
import { requireAuth, requireAdmin, setSession, cookieOptions } from './auth.js';

for (const key of ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL']) {
 if (!process.env[key]) throw new Error(`Missing ${key} in .env`);
}
if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must have at least 32 characters');
const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const origins = (process.env.FRONTEND_URL || '').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);
const origin = origins[0];
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (requestOrigin, callback) => callback(null, !requestOrigin || origins.includes(requestOrigin)), credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
 if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !origins.includes(req.headers.origin)) {
  return res.status(403).json({ message: 'Invalid origin' });
 }
 next();
});
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
const requestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', requestLimiter);
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const normalizeDigits = value => typeof value === 'string' ? value.replace(/[۰-۹٠-٩]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c) >= 0 ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(c) : '٠١٢٣٤٥٦٧٨٩'.indexOf(c))) : value;
const valid = (schema, body) => {
 const result = schema.safeParse(body);
 if (!result.success) { const error = new Error(result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') || 'Invalid input'); error.status = 400; throw error; }
 return result.data;
};
const text = (max = 120) => z.string().trim().min(1).max(max);
const email = z.string().trim().email().max(254).transform(s => s.toLowerCase());
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, city: u.city, address: u.address, bio: u.bio, birthDate: u.birth_date, avatar: u.avatar, role: u.role });

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/ready', asyncRoute(async (req, res) => {
 await db.query('SELECT 1');
 res.json({ ok: true, database: 'connected' });
}));

const randomToken = () => crypto.randomBytes(32).toString('hex');
const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
const siteUrl = () => process.env.FRONTEND_URL.replace(/\/$/, '');

async function sendVerification(user) {
 const token = randomToken();
 await db.query('DELETE FROM email_verification_tokens WHERE user_id=$1', [user.id]);
 await db.query("INSERT INTO email_verification_tokens(user_id,token_hash,expires_at) VALUES($1,$2,NOW() + INTERVAL '24 hours')", [user.id, tokenHash(token)]);
 await sendAccountEmail(user.email, 'Verify your NobatYar email', `Open this link to verify your account: ${siteUrl()}/verify-email?token=${token}`);
}

app.post('/api/auth/forgot-password', authLimiter, asyncRoute(async (req, res) => {
 if (!process.env.SMTP_HOST) return res.status(503).json({message:'Email service is not configured'});
 const data = valid(z.object({ email }), req.body);
 const result = await db.query('SELECT id,email FROM users WHERE email=$1', [data.email]);
 if (result.rows[0]) {
  const token = randomToken();
  await db.query('DELETE FROM password_reset_tokens WHERE user_id=$1', [result.rows[0].id]);
  await db.query("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,NOW() + INTERVAL '30 minutes')", [result.rows[0].id,tokenHash(token)]);
  await sendAccountEmail(data.email, 'Reset your NobatYar password', `Open this link to reset your password: ${siteUrl()}/reset-password?token=${token}`);
 }
 res.json({ message: 'If the email exists, a password reset link has been sent.' });
}));

app.post('/api/auth/reset-password', authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ token:z.string().min(20).max(200), password:z.string().min(8).max(128) }), req.body);
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  const result = await client.query("SELECT id,user_id FROM password_reset_tokens WHERE token_hash=$1 AND expires_at>NOW() AND used_at IS NULL FOR UPDATE", [tokenHash(data.token)]);
  if (!result.rows[0]) { await client.query('ROLLBACK'); return res.status(400).json({message:'Invalid or expired reset link'}); }
  const hash = await bcrypt.hash(data.password, 12);
  await client.query('UPDATE users SET password_hash=$1 WHERE id=$2',[hash,result.rows[0].user_id]);
  await client.query('UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1',[result.rows[0].user_id]);
  await client.query('COMMIT');
  res.json({message:'Password updated. Please sign in.'});
 } catch(error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
}));

app.post('/api/auth/verify-email', authLimiter, asyncRoute(async (req,res) => {
 const data = valid(z.object({token:z.string().min(20).max(200)}),req.body);
 const client=await db.connect();
 try {
  await client.query('BEGIN');
  const result=await client.query("SELECT id,user_id FROM email_verification_tokens WHERE token_hash=$1 AND expires_at>NOW() AND used_at IS NULL FOR UPDATE",[tokenHash(data.token)]);
  if (!result.rows[0]) { await client.query('ROLLBACK'); return res.status(400).json({message:'Invalid or expired verification link'}); }
  await client.query('UPDATE users SET email_verified=true WHERE id=$1',[result.rows[0].user_id]);
  await client.query('UPDATE email_verification_tokens SET used_at=NOW() WHERE user_id=$1',[result.rows[0].user_id]);
  await client.query('COMMIT');
  res.json({message:'Email verified successfully'});
 } catch(error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
}));

app.post('/api/auth/resend-verification',requireAuth,authLimiter,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT id,email,email_verified FROM users WHERE id=$1',[req.user.id]);
 if(!process.env.SMTP_HOST) return res.status(503).json({message:'Email service is not configured'});
 if(!r.rows[0].email_verified) await sendVerification(r.rows[0]);
 res.json({message:'If verification was needed, an email has been sent.'});
}));

app.post('/api/auth/register', authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), email, password: z.string().min(8).max(128), phone: z.string().max(40).default('') }), req.body);
 const hash = await bcrypt.hash(data.password, 12);
 try {
  const result = await db.query('INSERT INTO users(name,email,password_hash,phone) VALUES($1,$2,$3,$4) RETURNING id,name,email,phone,city,address,bio,birth_date,avatar,role', [data.name, data.email, hash, data.phone]);
  setSession(res, result.rows[0].id);
  if (process.env.SMTP_HOST) await sendVerification(result.rows[0]);
  res.status(201).json({ user: publicUser(result.rows[0]) });
 } catch (error) {
  if (error.code === '23505') return res.status(409).json({ message: 'Email already registered' });
  throw error;
 }
}));
app.post('/api/auth/login', authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ email, password: z.string().min(1), rememberMe: z.boolean().optional().default(false) }), req.body);
 const result = await db.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1)', [data.email]);
 const user = result.rows[0];
 if (!user || !(await bcrypt.compare(data.password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
 if (process.env.REQUIRE_VERIFIED_EMAIL === 'true' && !user.email_verified) return res.status(403).json({message:'Please verify your email before signing in'});
 setSession(res, user.id, data.rememberMe);
 res.json({ user: publicUser(user) });
}));
app.post('/api/auth/logout', (req, res) => {
 const options = cookieOptions();
 delete options.maxAge;
 res.clearCookie('nobatyar_session', options);
 res.json({ message: 'Logged out' });
});
app.get('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT provider_type,name FROM provider_profiles WHERE user_id=$1 ORDER BY id DESC LIMIT 1', [req.user.id]);
 res.json({ user: { ...req.user, providerType: result.rows[0]?.provider_type || null, providerName: result.rows[0]?.name || null } });
}));
app.patch('/api/profile', requireAuth, asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), phone: z.string().max(40), city: z.string().max(100), address: z.string().max(240).default(""), bio: z.string().max(500).default(""), birthDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).default("") }), req.body);
 const result = await db.query('UPDATE users SET name=$1,phone=$2,city=$3,address=$4,bio=$5,birth_date=$6 WHERE id=$7 RETURNING id,name,email,phone,city,address,bio,birth_date,avatar,role', [data.name, data.phone, data.city, data.address, data.bio, data.birthDate, req.user.id]);
 res.json({ user: publicUser(result.rows[0]) });
}));

app.patch("/api/profile/email", requireAuth, authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ email, password: z.string().min(1), rememberMe: z.boolean().optional().default(false) }), req.body);
 const current = await db.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id]);
 if (!current.rows[0] || !(await bcrypt.compare(data.password, current.rows[0].password_hash))) return res.status(401).json({ message: "Incorrect password" });
 try {
  const result = await db.query("UPDATE users SET email=$1 WHERE id=$2 RETURNING *", [data.email, req.user.id]);
  res.json({ user: publicUser(result.rows[0]) });
 } catch (error) {
  if (error.code === "23505") return res.status(409).json({ message: "Email already registered" });
  throw error;
 }
}));

const requirePersistentStorage = (req, res, next) => process.env.VERCEL ? res.status(503).json({ message: 'Private document storage is not configured on Vercel.' }) : next();
const uploads = path.resolve(process.env.VERCEL ? '/tmp/nobatyar-uploads' : 'uploads');
if (!process.env.VERCEL) fs.mkdirSync(uploads, { recursive: true });
const avatarUpload = multer({
 storage: multer.memoryStorage(),
 limits: { fileSize: 1024 * 1024 },
 fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(uploads, { fallthrough: false }));
app.post('/api/profile/avatar', requireAuth, avatarUpload.single('avatar'), asyncRoute(async (req, res) => {
 if (!cloudinaryEnabled()) return res.status(503).json({ message: 'Cloudinary is not configured on the backend.' });
 if (!req.file) return res.status(400).json({ message: 'Choose a JPG, PNG or WebP image under 1 MB' });
 const file = req.file.buffer;
 const isPng = file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const isJpg = file[0] === 255 && file[1] === 216 && file[2] === 255;
 const isWebp = file.toString('ascii',0,4) === 'RIFF' && file.toString('ascii',8,12) === 'WEBP';
 if (!((req.file.mimetype === 'image/png' && isPng) || (req.file.mimetype === 'image/jpeg' && isJpg) || (req.file.mimetype === 'image/webp' && isWebp))) return res.status(400).json({ message: 'Invalid image file' });
 const avatar = await uploadAvatarToCloudinary(file, req.user.id);
 try {
  await db.query('UPDATE users SET avatar=$1 WHERE id=$2', [avatar, req.user.id]);
 } catch (error) {
  await deleteCloudinaryAvatar(avatar).catch(console.error);
  throw error;
 }
 if (req.user.avatar?.startsWith('/uploads/')) fs.promises.unlink(path.join(uploads, path.basename(req.user.avatar))).catch(() => {});
 if (req.user.avatar?.startsWith('https://res.cloudinary.com/')) deleteCloudinaryAvatar(req.user.avatar).catch(console.error);
 res.json({ avatar });
}));
app.delete('/api/profile/avatar', requireAuth, asyncRoute(async (req, res) => {
 await db.query("UPDATE users SET avatar='' WHERE id=$1", [req.user.id]);
 if (req.user.avatar?.startsWith('/uploads/')) fs.promises.unlink(path.join(uploads, path.basename(req.user.avatar))).catch(() => {});
 if (req.user.avatar?.startsWith('https://res.cloudinary.com/')) deleteCloudinaryAvatar(req.user.avatar).catch(console.error);
 res.json({ avatar: '' });
}));

// Account deletion requires the current password. Admin accounts cannot self-delete.
app.delete('/api/profile', requireAuth, authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ password: z.string().min(1) }), req.body);
 if (req.user.role === 'admin') return res.status(403).json({message:'Admin account deletion is disabled to protect the system'});
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  const account = await client.query('SELECT password_hash FROM users WHERE id=$1 FOR UPDATE',[req.user.id]);
  if (!account.rowCount || !await bcrypt.compare(data.password, account.rows[0].password_hash)) {
   await client.query('ROLLBACK'); return res.status(403).json({message:'Incorrect password'});
  }
  const linked = await client.query('SELECT doctor_id FROM provider_doctors pd JOIN provider_profiles pp ON pp.id=pd.provider_id WHERE pp.user_id=$1',[req.user.id]);
  for (const item of linked.rows) {
   const history = await client.query('SELECT 1 FROM appointments WHERE doctor_id=$1 LIMIT 1',[item.doctor_id]);
   if (history.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({message:'This provider has appointment history. Contact the administrator to close the account safely.'}); }
  }
  for (const item of linked.rows) await client.query('DELETE FROM doctors WHERE id=$1',[item.doctor_id]);
  await client.query('DELETE FROM provider_requests WHERE user_id=$1',[req.user.id]);
  await client.query('DELETE FROM users WHERE id=$1',[req.user.id]);
  await client.query('COMMIT');
  const options=cookieOptions(); delete options.maxAge;
  res.clearCookie('nobatyar_session',options);
  res.json({ok:true});
 } catch(error) {await client.query('ROLLBACK');throw error;} finally {client.release();}
}));

app.get('/api/specialties', asyncRoute(async (req,res) => {
 const r = await db.query('SELECT id,name,value,department,image FROM medical_specialties ORDER BY name'); res.json(r.rows);
}));
app.get('/api/doctors', asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,specialty,specialty_value AS "specialtyValue",hospital,city,city_value AS "cityValue",image,experience,education,about FROM doctors ORDER BY id');
 const search = String(req.query.search || '').toLowerCase();
 const specialty = String(req.query.specialty || 'all');
 const city = String(req.query.city || 'all');
 res.json(result.rows.filter(d => (specialty === 'all' || d.specialtyValue === specialty) && (city === 'all' || d.cityValue === city) && (!search || [d.name,d.specialty,d.hospital].some(v => v.toLowerCase().includes(search)))));
}));
app.get('/api/doctors/:id', asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,specialty,specialty_value AS "specialtyValue",hospital,city,city_value AS "cityValue",image,experience,education,about FROM doctors WHERE id=$1', [req.params.id]);
 if (!result.rows[0]) return res.status(404).json({ message: 'Doctor not found' });
 res.json(result.rows[0]);
}));
app.get('/api/hospitals', asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,type,type_value AS "typeValue",city,city_value AS "cityValue",location,image,description FROM hospitals ORDER BY id');
 const search = String(req.query.search || '').toLowerCase();
 const type = String(req.query.type || 'all');
 const city = String(req.query.city || 'all');
 res.json(result.rows.filter(h => (type === 'all' || h.typeValue === type) && (city === 'all' || h.cityValue === city) && (!search || [h.name,h.location].some(v => v.toLowerCase().includes(search)))));
}));
app.get('/api/hospitals/:id', asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,type,type_value AS "typeValue",city,city_value AS "cityValue",location,image,description FROM hospitals WHERE id=$1', [req.params.id]);
 if (!result.rows[0]) return res.status(404).json({ message: 'Hospital not found' });
 res.json(result.rows[0]);
}));
app.get('/api/doctors/:id/booked-slots', asyncRoute(async (req, res) => {
 const date = String(req.query.date || '');
 if (!/^\d{4}\/\d{2}\/\d{2}$/.test(date)) return res.status(400).json({ message: 'Date must be YYYY/MM/DD' });
 const result = await db.query("SELECT time FROM appointments WHERE doctor_id=$1 AND date=$2 AND status <> 'cancelled'", [req.params.id, date]);
 res.json(result.rows.map(r => r.time));
}));
// Dates that have at least one available appointment slot.
app.get('/api/doctors/:id/bookable-days', asyncRoute(async (req, res) => {
 const month = String(req.query.month || '');
 if (!/^\d{4}\/\d{2}$/.test(month)) return res.status(400).json({ message: 'Invalid month' });
 const [year, number] = month.split('/').map(Number);
 if (number < 1 || number > 12 || year < 2020 || year > 2100) return res.status(400).json({ message: 'Invalid month' });
 const schedules = await db.query('SELECT weekday,start_time,end_time,slot_minutes FROM doctor_schedules WHERE doctor_id=$1 AND enabled=true', [req.params.id]);
 const daysOff = await db.query('SELECT date FROM doctor_days_off WHERE doctor_id=$1 AND date LIKE $2', [req.params.id, month + '/%']);
 const appointments = await db.query("SELECT date,time FROM appointments WHERE doctor_id=$1 AND date LIKE $2 AND status<>'cancelled'", [req.params.id, month + '/%']);
 const off = new Set(daysOff.rows.map(r => String(r.date).slice(0,10).replaceAll('-','/')));
 const booked = new Map();
 for (const a of appointments.rows) {
  const key = String(a.date).slice(0,10).replaceAll('-','/');
  if (!booked.has(key)) booked.set(key,new Set());
  booked.get(key).add(String(a.time).slice(0,5));
 }
 const result = [];
 const today = new Date().toISOString().slice(0,10).replaceAll('-','/');
 const last = new Date(Date.UTC(year,number,0)).getUTCDate();
 const minutes = t => Number(String(t).slice(0,2))*60 + Number(String(t).slice(3,5));
 for (let day=1; day<=last; day++) {
  const date = month + '/' + String(day).padStart(2,'0');
  if (date < today || off.has(date)) continue;
  const weekday = new Date(Date.UTC(year,number-1,day)).getUTCDay();
  const schedule = schedules.rows.find(r => Number(r.weekday) === weekday);
  if (!schedule) continue;
  const used = booked.get(date) || new Set();
  for (let m=minutes(schedule.start_time); m+Number(schedule.slot_minutes)<=minutes(schedule.end_time); m+=Number(schedule.slot_minutes)) {
   const time = String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
   if (!used.has(time)) { result.push(date); break; }
  }
 }
 res.json(result);
}));
app.get('/api/doctors/:id/available-slots',asyncRoute(async(req,res)=>{
 const date=normalizeDigits(String(req.query.date||''));
 if(!/^\d{4}\/\d{2}\/\d{2}$/.test(date))return res.status(400).json({message:'Invalid date'});
 const parsed=new Date(date.replaceAll('/','-')+'T12:00:00Z');
 if(Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10).replaceAll('-','/')!==date)return res.status(400).json({message:'Invalid date'});
 const off=await db.query('SELECT 1 FROM doctor_days_off WHERE doctor_id=$1 AND date=$2',[req.params.id,date]);
 if(off.rowCount)return res.json([]);
 const r=await db.query('SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND weekday=$2 AND enabled=true',[req.params.id,parsed.getUTCDay()]);
 if(!r.rowCount)return res.json([]);
 const a=r.rows[0];const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
 const booked=await db.query("SELECT time FROM appointments WHERE doctor_id=$1 AND date=$2 AND status<>'cancelled'",[req.params.id,date]);
 const used=new Set(booked.rows.map(x=>x.time.slice(0,5)));
 const slots=[];for(let m=minutes(a.start_time);m+Number(a.slot_minutes)<=minutes(a.end_time);m+=Number(a.slot_minutes)){
 const time=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');if(!used.has(time))slots.push(time);
 }
 res.json(slots);
}));
app.post('/api/appointments', requireAuth, asyncRoute(async (req, res) => {
 const body = { ...req.body, phone: normalizeDigits(req.body?.phone), date: normalizeDigits(req.body?.date), time: normalizeDigits(req.body?.time) };
 const data = valid(z.object({ doctorId: z.number().int().positive(), date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/), patientName: text(), phone: text(40), notes: z.string().max(1000).default('') }), body);
 const appointmentDate = new Date(data.date.replaceAll('/','-') + 'T12:00:00Z');
 if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.toISOString().slice(0,10).replaceAll('-','/') !== data.date) return res.status(400).json({message:'Invalid date'});
 if (data.date < new Date().toISOString().slice(0,10).replaceAll('-','/')) return res.status(400).json({message:'Cannot book a past date'});
 const weekday = appointmentDate.getUTCDay();
 const off = await db.query('SELECT 1 FROM doctor_days_off WHERE doctor_id=$1 AND date=$2',[data.doctorId,data.date]);
 if (off.rowCount) return res.status(409).json({message:'Doctor is unavailable on this date'});
 const schedule = await db.query('SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND weekday=$2',[data.doctorId,weekday]);
 if (!schedule.rows.length) return res.status(409).json({message:'Doctor has no schedule for this day'});
 if (schedule.rows.length) {
  const s=schedule.rows[0];
  const toMinutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
  const at=toMinutes(data.time), start=toMinutes(s.start_time), end=toMinutes(s.end_time);
  if (!s.enabled || at<start || at+s.slot_minutes>end || (at-start)%s.slot_minutes!==0) return res.status(409).json({message:'Time is outside doctor working hours'});
 }
 try {
  const result = await db.query('INSERT INTO appointments(user_id,doctor_id,date,time,patient_name,phone,notes) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [req.user.id, data.doctorId, data.date, data.time, data.patientName, data.phone, data.notes]);
  res.status(201).json(result.rows[0]);
 } catch (error) {
  if (error.code === '23505') return res.status(409).json({ message: 'This time is already booked' });
  if (error.code === '23503') return res.status(404).json({ message: 'Doctor not found' });
  throw error;
 }
}));
app.get('/api/appointments', requireAuth, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT a.id,a.doctor_id AS "doctorId",a.date,a.time,a.patient_name AS "patientName",a.phone,a.notes,a.status,a.created_at AS "createdAt" FROM appointments a WHERE user_id=$1 ORDER BY a.created_at DESC', [req.user.id]);
 res.json(result.rows);
}));
app.patch('/api/appointments/:id/cancel', requireAuth, asyncRoute(async (req, res) => {
 const result = await db.query("UPDATE appointments SET status='cancelled' WHERE id=$1 AND user_id=$2 AND status='pending' RETURNING id,status", [req.params.id, req.user.id]);
 if (!result.rows[0]) return res.status(404).json({ message: 'Pending appointment not found' });
 res.json(result.rows[0]);
}));
app.post('/api/contact', asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), email, message: text(3000) }), req.body);
 await db.query('INSERT INTO contacts(name,email,message) VALUES($1,$2,$3)', [data.name, data.email, data.message]);
 res.status(201).json({ message: 'Message received' });
}));
const providerPhotoUpload = multer({
 storage: multer.memoryStorage(),
 limits: { fileSize: 3 * 1024 * 1024 },
 fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
app.post('/api/provider-requests/photo', requireAuth, providerPhotoUpload.single('photo'), asyncRoute(async (req, res) => {
 if (!cloudinaryEnabled()) return res.status(503).json({ message: 'Cloudinary is not configured' });
 if (!req.file) return res.status(400).json({ message: 'Select a JPG, PNG or WebP photo under 3 MB' });
 const b = req.file.buffer;
 const validImage = (b[0]===255 && b[1]===216 && b[2]===255) || b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || (b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP');
 if (!validImage) return res.status(400).json({ message: 'Invalid image file' });
 const photoUrl = await uploadProviderPhotoToCloudinary(b, req.user.id);
 res.json({ photoUrl });
}));
const validProviderPhoto = (url, userId) => {
 const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
 return cloudinaryEnabled() && typeof url === 'string' && url.startsWith(prefix) && url.includes(`/nobatyar/provider-requests/user_${userId}_`);
};

async function addProviderCard(client, request, details, providerId = null) {
 await client.query('SELECT pg_advisory_xact_lock(728319)');
 if (request.provider_type === 'doctor') {
  const hospital = await client.query('SELECT name FROM hospitals WHERE id=$1', [details.hospitalId]);
  if (!hospital.rowCount) { const error=new Error('Select an existing hospital');error.status=400;throw error; }
  const next = await client.query('SELECT COALESCE(MAX(id),0)+1 AS id FROM doctors');
  const doctorId = next.rows[0].id;
  await client.query('INSERT INTO doctors(id,name,specialty,specialty_value,hospital,city,city_value,image,about) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [doctorId,request.name,details.specialty || 'General',details.specialty || 'General',hospital.rows[0].name,details.city || '',details.city || '',details.photoUrl,details.information || '']);
  if (providerId) await client.query('INSERT INTO provider_doctors(provider_id,doctor_id) VALUES($1,$2)',[providerId,doctorId]);
 } else {
  const next = await client.query('SELECT COALESCE(MAX(id),0)+1 AS id FROM hospitals');
  await client.query('INSERT INTO hospitals(id,name,type,type_value,city,city_value,location,image,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[next.rows[0].id,request.name,request.provider_type,request.provider_type,details.city || '',details.city || '',details.address || '',details.photoUrl,details.information || '']);
 }
}

app.post('/api/provider-requests', requireAuth, asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), email, phone: text(40), details: text(3000), providerType: z.enum(['doctor','hospital','clinic']) }), req.body);
 let details;
 try { details = JSON.parse(data.details); } catch { return res.status(400).json({ message: 'Invalid provider details' }); }
 if (!details || !validProviderPhoto(details.photoUrl, req.user.id)) return res.status(400).json({ message: 'A valid photo is required for every doctor, hospital and clinic' });
 if (!details.city || !details.address) return res.status(400).json({message:'City and address are required'});
 if (data.providerType === 'doctor' && !details.specialty) return res.status(400).json({message:'Medical specialty is required'});
 if (data.providerType === 'doctor' && !Number.isInteger(Number(details.hospitalId))) return res.status(400).json({message:'Select an existing hospital'});
 if (data.providerType === 'doctor') {
  const hospital = await db.query('SELECT id FROM hospitals WHERE id=$1',[details.hospitalId]);
  if (!hospital.rowCount) return res.status(400).json({message:'Selected hospital does not exist'});
  const specialty = await db.query('SELECT id FROM medical_specialties WHERE value=$1',[details.specialty]);
  if (!specialty.rowCount) return res.status(400).json({message:'Selected specialty does not exist'});
 }
 const existing = await db.query("SELECT id FROM provider_requests WHERE user_id=$1 AND status='pending' LIMIT 1", [req.user.id]);
 if (existing.rowCount && req.user.role !== 'admin') return res.status(409).json({ message: 'You already have a pending provider request' });
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  const admin = req.user.role === 'admin';
  const result = await client.query('INSERT INTO provider_requests(user_id,name,email,phone,details,provider_type,status,reviewed_by,reviewed_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [req.user.id,data.name,data.email,data.phone,data.details,data.providerType,admin?'approved':'pending',admin?req.user.id:null,admin?new Date():null]);
  if (admin) await addProviderCard(client,{name:data.name,provider_type:data.providerType},details);
  await client.query('COMMIT');
  res.status(201).json({message:admin?'Provider published':'Request received',id:result.rows[0].id,status:admin?'approved':'pending'});
 } catch (err) { await client.query('ROLLBACK'); throw err; }
 finally { client.release(); }
}));
app.get('/api/provider-requests/mine', requireAuth, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,email,phone,details,provider_type AS "providerType",status,review_note AS "reviewNote",created_at AS "createdAt" FROM provider_requests WHERE user_id=$1 AND status=$2 ORDER BY created_at DESC', [req.user.id,'pending']);
 res.json(result.rows);
}));
app.get('/api/admin/appointments', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 500');
 res.json(result.rows);
}));
app.patch('/api/admin/appointments/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
 const data = valid(z.object({ status: z.enum(['pending','confirmed','cancelled']) }), req.body);
 try {
  const result = await db.query('UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *', [data.status, req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(result.rows[0]);
 } catch (error) {
  if (error.code === '23505') return res.status(409).json({ message: 'Slot conflict' });
  throw error;
 }
}));
app.get('/api/admin/provider-requests', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT * FROM provider_requests WHERE status=\'pending\' ORDER BY created_at DESC LIMIT 500');
 res.json(result.rows);
}));
app.patch('/api/admin/provider-requests/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
 const data = valid(z.object({ status: z.enum(['approved','rejected']), note: z.string().trim().max(1000).default('') }), req.body);
 if (data.status === 'rejected' && !data.note) return res.status(400).json({ message: 'A rejection reason is required' });
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  const result = await client.query("UPDATE provider_requests SET status=$1,review_note=$2,reviewed_at=NOW(),reviewed_by=$3 WHERE id=$4 AND status='pending' RETURNING *", [data.status,data.note,req.user.id,req.params.id]);
  const request = result.rows[0];
  if (!request) { await client.query('ROLLBACK'); return res.status(409).json({ message: 'Request not found or already reviewed' }); }
  if (request.status !== 'pending' && request.status !== data.status) { await client.query('ROLLBACK'); return res.status(409).json({ message: 'Request has already been reviewed' }); }
  if (data.status === 'approved' && request.user_id) {
   let details = {}; try { details = JSON.parse(request.details); } catch {}
   if (!validProviderPhoto(details.photoUrl, request.user_id)) {
    await client.query('ROLLBACK'); return res.status(400).json({ message: 'A valid provider photo is required. Ask the applicant to submit a new request.' });
   }
   const currentProfile = await client.query('SELECT id FROM provider_profiles WHERE user_id=$1', [request.user_id]);
   if (currentProfile.rowCount) {
    await client.query('ROLLBACK'); return res.status(409).json({message:'This account already owns a provider profile. Use a separate account for another provider.'});
   }
   const profile = await client.query('INSERT INTO provider_profiles(user_id,request_id,provider_type,name,specialty,city,address,phone,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [request.user_id,request.id,request.provider_type,request.name,details.specialty||'',details.city||'',details.address||'',request.phone,details.information||'']);
   await addProviderCard(client,request,details,profile.rows[0].id);
   await client.query("UPDATE users SET role='provider' WHERE id=$1 AND role='patient'", [request.user_id]);
  }
  await client.query('COMMIT');
  res.json(request);
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
}));


const documentUploads = path.resolve(process.env.VERCEL ? '/tmp/nobatyar-documents' : 'private-documents');
fs.mkdirSync(documentUploads,{recursive:true});
const documentUpload = multer({storage:multer.diskStorage({destination:documentUploads,filename:(req,file,cb)=>cb(null,crypto.randomUUID()+'.pdf')}),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,file.mimetype==='application/pdf')});
app.post('/api/provider-requests/:id/document',requireAuth,requirePersistentStorage,documentUpload.single('document'),asyncRoute(async(req,res)=>{
 const request=await db.query('SELECT id FROM provider_requests WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);
 if(!request.rowCount){if(req.file)fs.unlinkSync(req.file.path);return res.status(404).json({message:'Request not found'});}
 if(!req.file)return res.status(400).json({message:'Upload a PDF under 5 MB'});
 const bytes=fs.readFileSync(req.file.path);
 if(bytes.toString('ascii',0,5)!=='%PDF-'){fs.unlinkSync(req.file.path);return res.status(400).json({message:'Invalid PDF'});}
 const r=await db.query('INSERT INTO provider_documents(request_id,user_id,stored_name,original_name) VALUES($1,$2,$3,$4) RETURNING id,original_name',[req.params.id,req.user.id,req.file.filename,req.file.originalname.slice(0,255)]);
 res.status(201).json(r.rows[0]);
}));
app.get('/api/admin/provider-requests/:id/documents',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT id,original_name,uploaded_at FROM provider_documents WHERE request_id=$1',[req.params.id]);res.json(r.rows);
}));
app.get('/api/admin/documents/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT stored_name FROM provider_documents WHERE id=$1',[req.params.id]);
 if(!r.rowCount)return res.status(404).json({message:'Document not found'});
 res.type('application/pdf');res.setHeader('Content-Disposition','attachment; filename="provider-document.pdf"');res.sendFile(path.join(documentUploads,path.basename(r.rows[0].stored_name)));
}));
app.get('/api/admin/doctors/:id/schedule',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const [s,d]=await Promise.all([db.query('SELECT * FROM doctor_schedules WHERE doctor_id=$1 ORDER BY weekday',[req.params.id]),db.query('SELECT date FROM doctor_days_off WHERE doctor_id=$1',[req.params.id])]);res.json({schedule:s.rows,daysOff:d.rows.map(r=>r.date)});
}));
const requireProviderDoctor = asyncRoute(async(req,res,next)=>{
 const owned = await db.query('SELECT 1 FROM provider_doctors pd JOIN provider_profiles p ON p.id=pd.provider_id WHERE pd.doctor_id=$1 AND p.user_id=$2 AND p.active=true', [req.params.id,req.user.id]);
 if (!owned.rowCount) return res.status(403).json({message:'This doctor is not linked to your provider account'});
 next();
});
const scheduleInput = z.object({weekday:z.number().int().min(0).max(6),startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),endTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),slotMinutes:z.number().int().min(10).max(120),enabled:z.boolean()});
app.get('/api/provider/doctors',requireAuth,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT d.id,d.name FROM doctors d JOIN provider_doctors pd ON pd.doctor_id=d.id JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$1 AND p.active=true ORDER BY d.name',[req.user.id]);res.json(r.rows);
}));
app.get('/api/provider/doctors/:id/schedule',requireAuth,requireProviderDoctor,asyncRoute(async(req,res)=>{
 const [s,d]=await Promise.all([db.query('SELECT * FROM doctor_schedules WHERE doctor_id=$1 ORDER BY weekday',[req.params.id]),db.query('SELECT date FROM doctor_days_off WHERE doctor_id=$1 ORDER BY date',[req.params.id])]);res.json({schedule:s.rows,daysOff:d.rows.map(r=>r.date)});
}));
app.put('/api/provider/doctors/:id/schedule',requireAuth,requireProviderDoctor,asyncRoute(async(req,res)=>{
 const d=valid(scheduleInput,req.body);
 if(d.startTime>=d.endTime)return res.status(400).json({message:'End time must be after start time'});
 const r=await db.query('INSERT INTO doctor_schedules(doctor_id,weekday,start_time,end_time,slot_minutes,enabled) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(doctor_id,weekday) DO UPDATE SET start_time=$3,end_time=$4,slot_minutes=$5,enabled=$6 RETURNING *',[req.params.id,d.weekday,d.startTime,d.endTime,d.slotMinutes,d.enabled]);res.json(r.rows[0]);
}));
app.post('/api/provider/doctors/:id/days-off',requireAuth,requireProviderDoctor,asyncRoute(async(req,res)=>{
 const d=valid(z.object({date:z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/)}),req.body);
 await db.query('INSERT INTO doctor_days_off(doctor_id,date) VALUES($1,$2) ON CONFLICT DO NOTHING',[req.params.id,d.date]);res.json({ok:true});
}));
app.delete('/api/provider/doctors/:id/days-off/:date',requireAuth,requireProviderDoctor,asyncRoute(async(req,res)=>{
 const d=valid(z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}),req.params);
 await db.query('DELETE FROM doctor_days_off WHERE doctor_id=$1 AND date=$2',[req.params.id,d.date.replaceAll('-','/')]);res.json({ok:true});
}));
const requireProvider = (req,res,next) => ['provider','admin'].includes(req.user.role) ? next() : res.status(403).json({message:'Provider access required'});
app.get('/api/admin/contacts', requireAuth, requireAdmin, asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 500'); res.json(r.rows);
}));
app.patch('/api/admin/contacts/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({status:z.enum(['unread','read','replied']),reply:z.string().max(3000).default('')}),req.body);
 const r=await db.query('UPDATE contacts SET status=$1,admin_reply=$2,replied_at=CASE WHEN $1=\'replied\' THEN NOW() ELSE replied_at END WHERE id=$3 RETURNING *',[d.status,d.reply,req.params.id]);
 if(!r.rows[0]) return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.get('/api/provider/dashboard',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT * FROM provider_profiles WHERE user_id=$1 ORDER BY id',[req.user.id]);res.json(r.rows);
}));
app.patch('/api/provider/dashboard/:id',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),phone:z.string().max(40),address:z.string().max(240),city:z.string().max(100),specialty:z.string().max(120),description:z.string().max(3000),services:z.string().max(3000),active:z.boolean()}),req.body);
 const r=await db.query('UPDATE provider_profiles SET name=$1,phone=$2,address=$3,city=$4,specialty=$5,description=$6,services=$7,active=$8 WHERE id=$9 AND user_id=$10 RETURNING *',[d.name,d.phone,d.address,d.city,d.specialty,d.description,d.services,d.active,req.params.id,req.user.id]);
 if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.get('/api/admin/providers',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT * FROM provider_profiles ORDER BY id DESC');res.json(r.rows);
}));
app.patch('/api/admin/providers/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({active:z.boolean()}),req.body);
 const r=await db.query('UPDATE provider_profiles SET active=$1 WHERE id=$2 RETURNING *',[d.active,req.params.id]);
 if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
// Admin-only: remove a provider profile without deleting the owner's user account.
app.delete('/api/admin/providers/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const client=await db.connect();
 try {
  await client.query('BEGIN');
  const p=await client.query('SELECT id,user_id,provider_type FROM provider_profiles WHERE id=$1 FOR UPDATE',[req.params.id]);
  if(!p.rowCount){await client.query('ROLLBACK');return res.status(404).json({message:'Provider not found'});}
  if(p.rows[0].user_id===req.user.id){await client.query('ROLLBACK');return res.status(403).json({message:'You cannot delete your own provider profile'});}
  const links=await client.query('SELECT doctor_id FROM provider_doctors WHERE provider_id=$1',[req.params.id]);
  const doctorIds=links.rows.map(row=>row.doctor_id);
  if(doctorIds.length){
   const booked=await client.query('SELECT 1 FROM appointments WHERE doctor_id=ANY($1::integer[]) LIMIT 1',[doctorIds]);
   if(booked.rowCount){await client.query('ROLLBACK');return res.status(409).json({message:'This provider has doctors with appointment history. Deletion is blocked to protect patient records.'});}
  }
  await client.query('DELETE FROM provider_profiles WHERE id=$1',[req.params.id]);
  for(const doctorId of doctorIds){
   const other=await client.query('SELECT 1 FROM provider_doctors WHERE doctor_id=$1 LIMIT 1',[doctorId]);
   if(!other.rowCount)await client.query('DELETE FROM doctors WHERE id=$1',[doctorId]);
  }
  await client.query("UPDATE users SET role='patient' WHERE id=$1 AND role='provider' AND NOT EXISTS (SELECT 1 FROM provider_profiles WHERE user_id=$1)",[p.rows[0].user_id]);
  await client.query('COMMIT');
  res.json({message:'Provider deleted. The user account was kept.'});
 }catch(error){await client.query('ROLLBACK');throw error;}
 finally{client.release();}
}));
app.get('/api/provider/appointments',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT a.id,a.patient_name,a.date,a.time,a.status,a.doctor_id FROM appointments a JOIN provider_doctors pd ON pd.doctor_id=a.doctor_id JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$1 ORDER BY a.created_at DESC LIMIT 500',[req.user.id]);res.json(r.rows);
}));
app.patch('/api/provider/appointments/:id',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const d=valid(z.object({status:z.enum(['confirmed','cancelled'])}),req.body);
 const r=await db.query('UPDATE appointments SET status=$1 WHERE id=$2 AND doctor_id IN (SELECT pd.doctor_id FROM provider_doctors pd JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$3) RETURNING id,status',[d.status,req.params.id,req.user.id]);
 if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.delete('/api/provider/appointments/:id',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const r=await db.query("UPDATE appointments SET status='cancelled' WHERE id=$1 AND doctor_id IN (SELECT pd.doctor_id FROM provider_doctors pd JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$2) RETURNING id",[req.params.id,req.user.id]);
 if(!r.rowCount)return res.status(404).json({message:'Appointment not found for your doctors'});
 res.json({ok:true});
}));
app.get('/api/admin/doctors',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{const r=await db.query('SELECT * FROM doctors ORDER BY id');res.json(r.rows);}));
app.get('/api/admin/hospitals',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{const r=await db.query('SELECT * FROM hospitals ORDER BY id');res.json(r.rows);}));
app.post('/api/admin/hospitals',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),type:z.enum(['government','private','clinic','hospital']).default('private'),city:text(),location:text(),description:z.string().max(3000).default(''),image:z.string().min(1).max(1000)}),req.body);
 const client=await db.connect();
 try {await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(20261023)');
  const r=await client.query('INSERT INTO hospitals(id,name,type,type_value,city,city_value,location,image,description) VALUES((SELECT COALESCE(MAX(id),0)+1 FROM hospitals),$1,$2,$2,$3,$3,$4,$5,$6) RETURNING *',[d.name,d.type,d.city,d.location,d.image,d.description]);
  await client.query('COMMIT');res.status(201).json(r.rows[0]);
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
app.post('/api/admin/doctors',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),specialty:text(),hospitalId:z.coerce.number().int().positive(),city:text(),about:z.string().max(3000).default(''),experience:z.string().max(200).default(''),education:z.string().max(200).default(''),image:z.string().min(1).max(1000)}),req.body);
 const hospital=await db.query('SELECT name FROM hospitals WHERE id=$1',[d.hospitalId]);
 if(!hospital.rowCount)return res.status(400).json({message:'Hospital not found'});
 const sp=await db.query('SELECT value FROM medical_specialties WHERE value=$1',[d.specialty]);
 if(!sp.rowCount)return res.status(400).json({message:'Specialty not found'});
 const client=await db.connect();
 try {await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(20261023)');
  const r=await client.query('INSERT INTO doctors(id,name,specialty,specialty_value,hospital,city,city_value,image,about,experience,education) VALUES((SELECT COALESCE(MAX(id),0)+1 FROM doctors),$1,$2,$2,$3,$4,$4,$5,$6,$7,$8) RETURNING *',[d.name,d.specialty,hospital.rows[0].name,d.city,d.image,d.about,d.experience,d.education]);
  await client.query('COMMIT');res.status(201).json(r.rows[0]);
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
app.patch('/api/admin/doctors/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),specialty:text(),hospitalId:z.coerce.number().int().positive(),city:text(),about:z.string().max(3000).default(''),experience:z.string().max(200).default(''),education:z.string().max(200).default(''),image:z.string().max(1000).optional()}),req.body);
 const h=await db.query('SELECT name FROM hospitals WHERE id=$1',[d.hospitalId]);
 if(!h.rowCount)return res.status(400).json({message:'Hospital not found'});
 const sp=await db.query('SELECT value FROM medical_specialties WHERE value=$1',[d.specialty]);
 if(!sp.rowCount)return res.status(400).json({message:'Specialty not found'});
 const r=await db.query('UPDATE doctors SET name=$1,specialty=$2,specialty_value=$2,hospital=$3,city=$4,city_value=$4,about=$5,image=COALESCE($7,image),experience=$8,education=$9 WHERE id=$6 RETURNING *',[d.name,d.specialty,h.rows[0].name,d.city,d.about,req.params.id,d.image||null,d.experience,d.education]);
 if(!r.rowCount)return res.status(404).json({message:'Doctor not found'});res.json(r.rows[0]);
}));
app.delete('/api/admin/doctors/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const booked=await db.query('SELECT 1 FROM appointments WHERE doctor_id=$1 LIMIT 1',[req.params.id]);
 if(booked.rowCount)return res.status(409).json({message:'This doctor has appointment history and cannot be deleted safely'});
 const r=await db.query('DELETE FROM doctors WHERE id=$1 RETURNING id',[req.params.id]);
 if(!r.rowCount)return res.status(404).json({message:'Doctor not found'});res.json({ok:true});
}));
app.patch('/api/admin/hospitals/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),location:text(),city:text(),type:z.enum(['government','private','clinic','hospital']).default('private'),description:z.string().max(3000),image:z.string().max(1000).optional()}),req.body);
 const client=await db.connect();
 try {await client.query('BEGIN');
  const old=await client.query('SELECT name FROM hospitals WHERE id=$1 FOR UPDATE',[req.params.id]);
  if(!old.rowCount){await client.query('ROLLBACK');return res.status(404).json({message:'Hospital not found'});}
  const r=await client.query('UPDATE hospitals SET name=$1,location=$2,city=$3,city_value=$3,description=$4,image=COALESCE($6,image),type=$7,type_value=$7 WHERE id=$5 RETURNING *',[d.name,d.location,d.city,d.description,req.params.id,d.image||null,d.type]);
  await client.query('UPDATE doctors SET hospital=$1 WHERE hospital=$2',[d.name,old.rows[0].name]);
  await client.query('COMMIT');res.json(r.rows[0]);
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
app.delete('/api/admin/hospitals/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const h=await db.query('SELECT name FROM hospitals WHERE id=$1',[req.params.id]);
 if(!h.rowCount)return res.status(404).json({message:'Hospital not found'});
 const linked=await db.query('SELECT 1 FROM doctors WHERE hospital=$1 LIMIT 1',[h.rows[0].name]);
 if(linked.rowCount)return res.status(409).json({message:'Move or delete the hospital doctors first'});
 await db.query('DELETE FROM hospitals WHERE id=$1',[req.params.id]);res.json({ok:true});
}));
app.post('/api/admin/catalog/photo',requireAuth,requireAdmin,providerPhotoUpload.single('photo'),asyncRoute(async(req,res)=>{
 if(!cloudinaryEnabled())return res.status(503).json({message:'Cloudinary is not configured'});
 if(!req.file)return res.status(400).json({message:'Select an image under 3 MB'});
 const b=req.file.buffer;
 const ok=(b[0]===255&&b[1]===216&&b[2]===255)||b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP');
 if(!ok)return res.status(400).json({message:'Invalid image'});
 res.json({image:await uploadSpecialtyImageToCloudinary(b,req.user.id)});
}));
app.post('/api/admin/specialties/photo', requireAuth, requireAdmin, providerPhotoUpload.single('photo'), asyncRoute(async (req,res) => {
 if (!cloudinaryEnabled()) return res.status(503).json({message:'Cloudinary is not configured'});
 if (!req.file) return res.status(400).json({message:'Select a JPG, PNG or WebP image under 3 MB'});
 const b=req.file.buffer;
 const validImage=(b[0]===255&&b[1]===216&&b[2]===255)||b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP');
 if (!validImage) return res.status(400).json({message:'Invalid image file'});
 res.json({image:await uploadSpecialtyImageToCloudinary(b,req.user.id)});
}));
app.post('/api/admin/specialties',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),value:z.string().regex(/^[a-z][a-zA-Z0-9_-]{1,79}$/),department:text(160),image:z.string().url().max(1000)}),req.body);
 if(!d.image.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`))return res.status(400).json({message:'Upload a specialty image first'});
 const r=await db.query('INSERT INTO medical_specialties(name,value,department,image) VALUES($1,$2,$3,$4) RETURNING *',[d.name,d.value,d.department,d.image]);res.status(201).json(r.rows[0]);
}));
app.patch('/api/admin/specialties/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),value:z.string().regex(/^[a-z][a-zA-Z0-9_-]{1,79}$/),department:text(160),image:z.string().url().max(1000)}),req.body);
 const client=await db.connect();
 try {
  await client.query('BEGIN');
  const old=await client.query('SELECT value FROM medical_specialties WHERE id=$1 FOR UPDATE',[req.params.id]);
  if(!old.rowCount){await client.query('ROLLBACK');return res.status(404).json({message:'Specialty not found'});}
  const r=await client.query('UPDATE medical_specialties SET name=$1,value=$2,department=$3,image=$4 WHERE id=$5 RETURNING *',[d.name,d.value,d.department,d.image,req.params.id]);
  await client.query('UPDATE doctors SET specialty=$1,specialty_value=$1 WHERE specialty_value=$2',[d.value,old.rows[0].value]);
  await client.query('COMMIT');res.json(r.rows[0]);
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
app.delete('/api/admin/specialties/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT value FROM medical_specialties WHERE id=$1',[req.params.id]);
 if(!r.rowCount)return res.status(404).json({message:'Specialty not found'});
 const used=await db.query('SELECT 1 FROM doctors WHERE specialty_value=$1 LIMIT 1',[r.rows[0].value]);
 if(used.rowCount)return res.status(409).json({message:'This specialty is used by doctors'});
 await db.query('DELETE FROM medical_specialties WHERE id=$1',[req.params.id]);res.json({ok:true});
}));
app.use((error, req, res, next) => {
 if (error instanceof multer.MulterError) return res.status(400).json({ message: error.message });
 if (error.code === '23505') return res.status(409).json({ message: 'This value already exists' });
 if (error.code === '22P02') return res.status(400).json({ message: 'Invalid ID' });
 if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Invalid JSON' });
 console.error(error);
 res.status(error.status || 500).json({ message: error.status ? error.message : 'Server error' });
});
if (!process.env.VERCEL) {
 const port = Number(process.env.PORT || 5001);
 app.listen(port, () => console.log(`NobatYar API running on http://localhost:${port}`));
}
export default app;
