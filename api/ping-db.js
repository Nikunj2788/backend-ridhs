// api/ping-db.js
const express = require('express');
const router = express.Router();

// Import pool with error handling
let pool;
try {
  pool = require('../db/db');
  console.log('Pool successfully imported:', !!pool);
} catch (error) {
  console.error('❌ Failed to import db module:', error);
}

router.get('/', async (req, res) => {
  // If pool wasn't imported correctly, return error immediately
  if (!pool) {
    console.error('❌ DB pool is not available');
    return res.status(500).json({ 
      error: 'Database pool not initialized',
      message: 'Server configuration error' 
    });
  }

  // Attempt connection
  let client;
  try {
    // Log connection attempt
    console.log('Attempting to connect to database...');
    
    // Debug info
    console.log('Pool type:', typeof pool);
    console.log('Pool methods:', Object.keys(pool));
    
    // Get client from pool
    client = await pool.connect();
    console.log('✅ Client connected from pool');
    
    // Run simple query
    const result = await client.query('SELECT NOW() AS now');
    console.log('✅ Query executed successfully');
    
    // Return success
    res.status(200).json({ 
      message: 'DB connected!', 
      serverTime: result.rows[0].now,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    
    // Detailed error response
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  } finally {
    // Release client back to pool if it was obtained
    if (client) {
      try {
        client.release();
        console.log('✅ Client released back to pool');
      } catch (releaseErr) {
        console.error('❌ Error releasing client:', releaseErr);
      }
    }
  }
});

module.exports = router;