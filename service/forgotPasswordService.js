const crypto = require('crypto');
const transporter = require('../config/configEmail');
const db = require('../db/db');
const bcrypt = require('bcryptjs');

async function handleForgotPassword(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store token in DB
    await db.query(
        'UPDATE register SET reset_token = $1, token_expires = $2 WHERE email = $3',
        [token, expiresAt, email]
    );

    const resetLink = `https://www.ridhsdesign.com/reset-password?token=${token}`;

    // Send Email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password - Ridhs Design',
        html: `
      <h3>Reset Your Password</h3>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetLink}">${resetLink}</a>
    `
    };

    await transporter.sendMail(mailOptions);
}

async function handleResetPassword(token, newPassword) {
    // Verify token
    const result = await db.query(
        'SELECT email FROM register WHERE reset_token = $1 AND token_expires > NOW()',
        [token]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const email = result.rows[0].email;

    await db.query(
        'UPDATE register SET password = $1, reset_token = NULL, token_expires = NULL WHERE email = $2',
        [hashedPassword, email]
    );

}

module.exports = {
    handleForgotPassword,
    handleResetPassword
};
