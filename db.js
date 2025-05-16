const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;
