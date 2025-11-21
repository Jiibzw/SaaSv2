const db = require('./lib/db');

async function checkSchema() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
}

checkSchema();
