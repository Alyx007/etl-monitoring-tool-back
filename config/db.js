const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASS,
    port: env.DB_PORT,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

module.exports = {
    pool,
};
