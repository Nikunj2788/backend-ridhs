// routes/ping-db.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT NOW() AS now');
        res.json({
            message: 'Connected to Supabase PostgreSQL!',
            serverTime: result.rows[0].now
        });
    } catch (err) {
        console.error('Error connecting to DB:', err);
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
