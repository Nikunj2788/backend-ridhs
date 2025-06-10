const { handleEmailSubscription } = require('../service/configService');

async function subscribeEmail(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await handleEmailSubscription(email);
    res.status(200).json({ 
      message: 'Thank you for subscribing! You\'ll receive 10% off shortly.' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Subscription failed. Please try again.' });
  }
}

module.exports = {
  subscribeEmail
};