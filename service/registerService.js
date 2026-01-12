const db = require('../db/db');
const bcrypt = require('bcrypt');

async function saveRegistration({ firstName, lastName, email, password, role_id }) {
  const existingUser = await db.query('SELECT 1 FROM register WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Default to role_id 3 (Customer) if no role is provided
  const finalRoleId = role_id || 3;

  const query = `
    INSERT INTO register (first_name, last_name, email, password, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [firstName, lastName, email, hashedPassword, finalRoleId];

  const result = await db.query(query, values);
  return result.rows[0];
}

module.exports = { saveRegistration };
