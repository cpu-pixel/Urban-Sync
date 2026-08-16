import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Prevent pg from auto-converting DATE columns into JS Date objects.
// Without this, '2026-10-01' becomes a UTC midnight Date, which shows as
// '2026-09-30' in IST (+5:30) after toISOString(). Return raw strings instead.
types.setTypeParser(1082, (val: string) => val);       // DATE
types.setTypeParser(1114, (val: string) => val);       // TIMESTAMP WITHOUT TZ
types.setTypeParser(1184, (val: string) => val);       // TIMESTAMP WITH TZ

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL database');
});