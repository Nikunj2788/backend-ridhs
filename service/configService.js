const transporter = require('../config/configEmail');
const db = require('../db/db');

async function handleEmailSubscription(email) {
  // Save to database
  await db.query(
    'INSERT INTO subscribers (email, subscribed_at) VALUES ($1, NOW())',
    [email]
  );

  // Send confirmation email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '10% Off Your First Purchase!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6C5BAB;">Welcome to Ridhs Design!</h2>
        <p>Thank you for subscribing to our newsletter. Here's your 10% discount code:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <strong style="color: #9B87F5; font-size: 18px;">RIDHS10</strong>
        </div>
        <p>Use this code at checkout for 10% off your first purchase.</p>
        <p>Happy shopping!<br/>The Ridhs Design Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  handleEmailSubscription
};