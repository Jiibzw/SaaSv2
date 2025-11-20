const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Current database time:', res.rows[0].now);
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    if (err.code === '28P01') {
        console.error('Hint: Check your username and password in .env');
    } else if (err.code === '3D000') {
        console.error('Hint: The database name might be incorrect or does not exist.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Hint: Is PostgreSQL running? Check the host and port.');
    }
    process.exit(1);
  }
}

testConnection();
