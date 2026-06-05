const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'found (hidden)' : 'undefined');

const pool = require('./db/pool');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB connected:', res.rows[0]);
  } catch (err) {
    console.error('DB connection error:', err.message);
  } finally {
    pool.end();
  }
}

test();