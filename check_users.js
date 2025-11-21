const db = require('./lib/db');

async function checkUsers() {
  try {
    const res = await db.query('SELECT username, stripe_customer_id, stripe_subscription_id FROM users');
    console.log('Users in DB:', res.rows);
  } catch (err) {
    console.error(err);
  }
}

checkUsers();