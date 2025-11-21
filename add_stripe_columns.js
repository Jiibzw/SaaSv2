const db = require('./lib/db');

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
    `);
    console.log('Columns added successfully');
  } catch (err) {
    console.error(err);
  }
}

migrate();
