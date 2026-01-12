const db = require('../db/db');

async function getUserByEmail(email) {
    const query = 'SELECT id, first_name, email, password, role_id FROM register WHERE email = $1';
    const result = await db.query(query, [email]);

    return result.rows[0]; 
}

module.exports = { getUserByEmail };
