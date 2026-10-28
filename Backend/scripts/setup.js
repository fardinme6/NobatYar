import 'dotenv/config';
import fs from 'node:fs/promises';
import { db } from '../src/db.js';

// Create the database schema only. Doctors and hospitals are added in the admin panel.
try {
  await db.query(await fs.readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
  console.log('Database schema initialized. Add doctors and hospitals through the admin panel.');
} finally {
  await db.end();
}
