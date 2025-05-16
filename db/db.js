// db/db.js
const { Pool } = require('pg');

// In production, dotenv might not be available or necessary if env vars are set through the hosting platform
let dotenvLoaded = false;
try {
  require('dotenv').config();
  dotenvLoaded = true;
} catch (error) {
  console.log('dotenv not available, assuming environment variables are set directly');
}

// Get connection string from environment variables
const connectionString = process.env.SUPABASE_POSTGRES_URL;

// Debug logs for troubleshooting
console.log('dotenv loaded:', dotenvLoaded);
console.log('connectionString available:', !!connectionString);

// Handle missing connection string
if (!connectionString) {
  console.error('❌ DATABASE CONNECTION STRING IS MISSING');
  console.error('Environment variables available:', Object.keys(process.env)
    .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD'))
    .join(', '));
}

// Create pool with more detailed configuration
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for many cloud database providers
  },
  // Add connection timeout
  connectionTimeoutMillis: 5000,
  // Add query timeout
  statement_timeout: 10000,
});

// Add connection validation
pool.on('connect', client => {
  console.log('✅ New database connection established');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on database client', err);
});

// Verify pool has query method
if (pool && (!pool.query || typeof pool.query !== 'function')) {
  console.error('❌ Pool is missing query method:', pool);
}

// Export pool
module.exports = pool;