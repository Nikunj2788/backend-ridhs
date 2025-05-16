// service/contactService.js
const db = require('../db/db');

async function saveContactForm({ firstName, lastName, email, subject, message }) {
  const query = `
    INSERT INTO contact_us (first_name, last_name, email, subject, message)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [firstName, lastName, email, subject, message];
  
  await db.query(query, values);
}

module.exports = { saveContactForm };
