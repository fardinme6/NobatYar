import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import multer from 'multer';
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
const valid = (schema, body) => {
 const result = schema.safeParse(body);
 if (!result.success) { const error = new Error('Invalid input'); error.status = 400; throw error; }
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
 const data = valid(z.object({ email, password: z.string().min(1) }), req.body);
 const result = await db.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1)', [data.email]);
 const user = result.rows[0];
 if (!user || !(await bcrypt.compare(data.password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
 if (process.env.REQUIRE_VERIFIED_EMAIL === 'true' && !user.email_verified) return res.status(403).json({message:'Please verify your email before signing in'});
 setSession(res, user.id);
 res.json({ user: publicUser(user) });
}));
app.post('/api/auth/logout', (req, res) => {
 const options = cookieOptions();
 delete options.maxAge;
 res.clearCookie('nobatyar_session', options);
 res.json({ message: 'Logged out' });
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }));
app.patch('/api/profile', requireAuth, asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), phone: z.string().max(40), city: z.string().max(100), address: z.string().max(240).default(""), bio: z.string().max(500).default(""), birthDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).default("") }), req.body);
 const result = await db.query('UPDATE users SET name=$1,phone=$2,city=$3,address=$4,bio=$5,birth_date=$6 WHERE id=$7 RETURNING id,name,email,phone,city,address,bio,birth_date,avatar,role', [data.name, data.phone, data.city, data.address, data.bio, data.birthDate, req.user.id]);
 res.json({ user: publicUser(result.rows[0]) });
}));

app.patch("/api/profile/email", requireAuth, authLimiter, asyncRoute(async (req, res) => {
 const data = valid(z.object({ email, password: z.string().min(1) }), req.body);
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

const requirePersistentStorage = (req, res, next) => process.env.VERCEL ? res.status(503).json({ message: 'File uploads require private persistent storage; not enabled on Vercel.' }) : next();
const uploads = path.resolve(process.env.VERCEL ? '/tmp/nobatyar-uploads' : 'uploads');
fs.mkdirSync(uploads, { recursive: true });
const upload = multer({
 storage: multer.diskStorage({ destination: uploads, filename: (req, file, cb) => cb(null, `${req.user.id}-${crypto.randomUUID()}.${file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg'}`) }),
 limits: { fileSize: 1024 * 1024 },
 fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(uploads, { fallthrough: false }));
app.post('/api/profile/avatar', requireAuth, requirePersistentStorage, upload.single('avatar'), asyncRoute(async (req, res) => {
 if (!req.file) return res.status(400).json({ message: 'Choose a JPG, PNG or WebP image under 1 MB' });
 const file = fs.readFileSync(req.file.path);
 const isPng = file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const isJpg = file[0] === 255 && file[1] === 216 && file[2] === 255;
 const isWebp = file.toString('ascii',0,4) === 'RIFF' && file.toString('ascii',8,12) === 'WEBP';
 if (!((req.file.mimetype === 'image/png' && isPng) || (req.file.mimetype === 'image/jpeg' && isJpg) || (req.file.mimetype === 'image/webp' && isWebp))) {
  fs.unlinkSync(req.file.path);
  return res.status(400).json({ message: 'Invalid image file' });
 }
 const avatar = `/uploads/${req.file.filename}`;
 await db.query('UPDATE users SET avatar=$1 WHERE id=$2', [avatar, req.user.id]);
 if (req.user.avatar?.startsWith('/uploads/')) fs.promises.unlink(path.join(uploads, path.basename(req.user.avatar))).catch(() => {});
 res.json({ avatar });
}));
app.delete('/api/profile/avatar', requireAuth, asyncRoute(async (req, res) => {
 await db.query("UPDATE users SET avatar='' WHERE id=$1", [req.user.id]);
 if (req.user.avatar?.startsWith('/uploads/')) fs.promises.unlink(path.join(uploads, path.basename(req.user.avatar))).catch(() => {});
 res.json({ avatar: '' });
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
app.post('/api/appointments', requireAuth, asyncRoute(async (req, res) => {
 const data = valid(z.object({ doctorId: z.number().int().positive(), date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/), patientName: text(), phone: text(40), notes: z.string().max(1000).default('') }), req.body);
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
app.post('/api/provider-requests', requireAuth, asyncRoute(async (req, res) => {
 const data = valid(z.object({ name: text(), email, phone: text(40), details: text(3000), providerType: z.enum(['doctor','hospital','clinic']) }), req.body);
 const result=await db.query('INSERT INTO provider_requests(user_id,name,email,phone,details,provider_type) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [req.user.id, data.name, data.email, data.phone, data.details, data.providerType]);
 res.status(201).json({ message: 'Request received', id: result.rows[0].id });
}));
app.get('/api/provider-requests/mine', requireAuth, asyncRoute(async (req, res) => {
 const result = await db.query('SELECT id,name,email,phone,details,provider_type AS "providerType",status,review_note AS "reviewNote",created_at AS "createdAt" FROM provider_requests WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
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
 const result = await db.query('SELECT * FROM provider_requests ORDER BY created_at DESC LIMIT 500');
 res.json(result.rows);
}));
app.patch('/api/admin/provider-requests/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
 const data = valid(z.object({ status: z.enum(['approved','rejected']), note: z.string().trim().max(1000).default('') }), req.body);
 if (data.status === 'rejected' && !data.note) return res.status(400).json({ message: 'A rejection reason is required' });
 const client = await db.connect();
 try {
  await client.query('BEGIN');
  const result = await client.query('UPDATE provider_requests SET status=$1,review_note=$2,reviewed_at=NOW(),reviewed_by=$3 WHERE id=$4 RETURNING *', [data.status,data.note,req.user.id,req.params.id]);
  const request = result.rows[0];
  if (!request) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found' }); }
  if (data.status === 'approved' && request.user_id) {
   let details = {}; try { details = JSON.parse(request.details); } catch {}
   await client.query('INSERT INTO provider_profiles(user_id,request_id,provider_type,name,specialty,city,address,phone,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(request_id) DO NOTHING', [request.user_id,request.id,request.provider_type,request.name,details.specialty||'',details.city||'',details.address||'',request.phone,details.information||'']);
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
app.put('/api/admin/doctors/:id/schedule',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({weekday:z.number().int().min(0).max(6),startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),endTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),slotMinutes:z.number().int().min(10).max(120),enabled:z.boolean()}),req.body);
 if(d.startTime>=d.endTime)return res.status(400).json({message:'End time must be after start time'});
 const r=await db.query('INSERT INTO doctor_schedules(doctor_id,weekday,start_time,end_time,slot_minutes,enabled) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(doctor_id,weekday) DO UPDATE SET start_time=$3,end_time=$4,slot_minutes=$5,enabled=$6 RETURNING *',[req.params.id,d.weekday,d.startTime,d.endTime,d.slotMinutes,d.enabled]);res.json(r.rows[0]);
}));
app.post('/api/admin/doctors/:id/days-off',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({date:z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/)}),req.body);
 await db.query('INSERT INTO doctor_days_off(doctor_id,date) VALUES($1,$2) ON CONFLICT DO NOTHING',[req.params.id,d.date]);res.json({ok:true});
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
app.get('/api/provider/appointments',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const r=await db.query('SELECT a.id,a.patient_name,a.date,a.time,a.status,a.doctor_id FROM appointments a JOIN provider_doctors pd ON pd.doctor_id=a.doctor_id JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$1 ORDER BY a.created_at DESC LIMIT 500',[req.user.id]);res.json(r.rows);
}));
app.patch('/api/provider/appointments/:id',requireAuth,requireProvider,asyncRoute(async(req,res)=>{
 const d=valid(z.object({status:z.enum(['confirmed','cancelled'])}),req.body);
 const r=await db.query('UPDATE appointments SET status=$1 WHERE id=$2 AND doctor_id IN (SELECT pd.doctor_id FROM provider_doctors pd JOIN provider_profiles p ON p.id=pd.provider_id WHERE p.user_id=$3) RETURNING id,status',[d.status,req.params.id,req.user.id]);
 if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.get('/api/admin/doctors',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{const r=await db.query('SELECT * FROM doctors ORDER BY id');res.json(r.rows);}));
app.get('/api/admin/hospitals',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{const r=await db.query('SELECT * FROM hospitals ORDER BY id');res.json(r.rows);}));
app.patch('/api/admin/doctors/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),specialty:text(),hospital:text(),city:text()}),req.body);
 const r=await db.query('UPDATE doctors SET name=$1,specialty=$2,hospital=$3,city=$4 WHERE id=$5 RETURNING *',[d.name,d.specialty,d.hospital,d.city,req.params.id]);if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.patch('/api/admin/hospitals/:id',requireAuth,requireAdmin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({name:text(),location:text(),city:text(),description:z.string().max(3000)}),req.body);
 const r=await db.query('UPDATE hospitals SET name=$1,location=$2,city=$3,description=$4 WHERE id=$5 RETURNING *',[d.name,d.location,d.city,d.description,req.params.id]);if(!r.rows[0])return res.status(404).json({message:'Not found'});res.json(r.rows[0]);
}));
app.use((error, req, res, next) => {
 if (error instanceof multer.MulterError) return res.status(400).json({ message: error.message });
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
