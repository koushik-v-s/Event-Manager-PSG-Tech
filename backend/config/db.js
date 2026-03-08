const { Pool } = require('pg');
const env = require('./dotenv');

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: parseInt(env.DB_PORT, 10),
});

async function connectToDb(retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Test connection with a simple query
      await pool.query('SELECT NOW()');
      console.log('Database connected successfully');
      return;
    } catch (err) {
      console.error(`Database connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) {
        console.error('Maximum database connection retries reached. Application will terminate.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { pool, connectToDb };