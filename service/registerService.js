const db = require('../db/db');

async function saveRegistration({ firstName, lastName, email, password }) {
    const query = `
    INSERT INTO register (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
  `;
    const values = [firstName, lastName, email, password];

    await db.query(query, values);
}

module.exports = { saveRegistration };
