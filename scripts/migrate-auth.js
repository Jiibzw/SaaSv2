const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateAuth() {
  console.log('Migrating auth schema...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        salon_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created.');

    // Check if admin exists
    const res = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (res.rows.length === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (username, password_hash, role)
        VALUES ($1, $2, 'admin')
      `, ['admin', adminHash]);
      console.log('✅ Default admin user created.');
    }

    // Create specific salon users
    const salons = ['chic', 'beaute', 'elegance', 'moderne', 'studio'];
    const defaultSalonPassword = 'salon2025'; // Mot de passe provisoire

    for (const salon of salons) {
      const username = `salon_${salon}`;
      const userRes = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (userRes.rows.length === 0) {
        const hash = await bcrypt.hash(defaultSalonPassword, 10);
        await client.query(`
          INSERT INTO users (username, password_hash, role, salon_id)
          VALUES ($1, $2, 'salon', $3)
        `, [username, hash, salon]);
        console.log(`✅ User ${username} created.`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Migration complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAuth();
