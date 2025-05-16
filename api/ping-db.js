// // Local Express version of ping-db.js
// const express = require('express');
// const router = express.Router();
// let pool;

// try {
//   pool = require('../db/db');
//   console.log('Pool successfully imported:', !!pool);
// } catch (error) {
//   console.error('❌ Failed to import db module:', error);
// }

// router.get('/', async (req, res) => {
//   if (!pool) {
//     return res.status(500).json({
//       error: 'Database pool not initialized',
//       message: 'Server configuration error',
//     });
//   }

//   let client;

//   try {
//     client = await pool.connect();
//     const result = await client.query('SELECT NOW() AS now');
//     res.status(200).json({
//       message: 'DB connected!',
//       serverTime: result.rows[0].now,
//       environment: process.env.NODE_ENV || 'development',
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: 'Database connection failed',
//       details: err.message,
//     });
//   } finally {
//     if (client) {
//       try {
//         client.release();
//       } catch (releaseErr) {
//         console.error('Error releasing client:', releaseErr);
//       }
//     }
//   }
// });

// module.exports = router;


// Vercel Serverless Function version of ping-db.js
const { Pool } = require('pg');

let pool;

if (!pool) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } catch (err) {
    console.error('Failed to create PostgreSQL pool:', err);
  }
}

module.exports = async function (req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!pool) {
    return res.status(500).json({
      error: 'Database pool not initialized',
      message: 'Server configuration error',
    });
  }

  let client;

  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() AS now');
    res.status(200).json({
      message: 'DB connected!',
      serverTime: result.rows[0].now,
      environment: process.env.NODE_ENV || 'production',
    });
  } catch (err) {
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr);
      }
    }
  }
};
