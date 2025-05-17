const db = require('../db/db');
const bcrypt = require('bcrypt');

async function saveRegistration({ firstName, lastName, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  const query = `
    INSERT INTO register (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [firstName, lastName, email, hashedPassword];

  await db.query(query, values);
}

module.exports = { saveRegistration };
