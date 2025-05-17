const db = require('../db/db');

async function getUserByEmail(email) {
    const query = 'SELECT * FROM register WHERE email = $1';
    const result = await db.query(query, [email]);

    return result.rows[0]; // returns undefined if not found
}

module.exports = { getUserByEmail };
