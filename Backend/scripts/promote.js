import 'dotenv/config';
import { db } from '../src/db.js';
const email = process.argv[2]?.toLowerCase();
if (!email) { console.error('Usage: npm run admin:promote -- email@example.com'); process.exit(1); }
try {
 const result = await db.query("UPDATE users SET role='admin' WHERE email=$1 RETURNING id,email,role", [email]);
 console.log(result.rows[0] || 'User not found');
} finally { await db.end(); }
