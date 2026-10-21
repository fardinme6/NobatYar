import jwt from 'jsonwebtoken';
import { db } from './db.js';
export const cookieOptions = (remember = false) => ({
 httpOnly: true,
 secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
 sameSite: process.env.COOKIE_SAMESITE || 'lax',
 path: '/',
 ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {})
});
export const setSession = (res, userId, remember = false) => {
 const token = jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: remember ? '7d' : '12h' });
 res.cookie('nobatyar_session', token, cookieOptions(remember));
};
export async function requireAuth(req, res, next) {
 try {
  const token = req.cookies.nobatyar_session;
  if (!token) return res.status(401).json({ message: 'Please log in' });
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const result = await db.query('SELECT id, name, email, phone, city, address, bio, birth_date AS "birthDate", avatar, role FROM users WHERE id=$1', [payload.id]);
  if (!result.rows[0]) return res.status(401).json({ message: 'Invalid session' });
  req.user = result.rows[0];
  next();
 } catch (error) {
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Invalid session' });
  next(error);
 }
}
export function requireAdmin(req, res, next) {
 if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
 next();
}
