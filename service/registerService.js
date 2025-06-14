const db = require('../db/db');
const bcrypt = require('bcrypt');

async function saveRegistration({ firstName, lastName, email, password }) {
  // Check if email already exists
  const existingUser = await db.query('SELECT 1 FROM register WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Optional: validate email format (server-side, in case frontend fails)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO register (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [firstName, lastName, email, hashedPassword];

  await db.query(query, values);
}


module.exports = { saveRegistration };
