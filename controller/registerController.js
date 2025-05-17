const registerService = require('../service/registerService');

async function handleRegisterForm(req, res) {
  console.log('✅ handleRegisterForm called'); // 👈 Add this
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method); // 👈 Add this
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstName, lastName, email, password } = req.body;
  console.log('📦 Incoming body:', req.body); // 👈 Add this

  if (!firstName || !lastName || !email || !password) {
    console.log('❌ Missing fields'); // 👈 Add this
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await registerService.saveRegistration({ firstName, lastName, email, password });
    console.log('✅ User saved');
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('❌ Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  handleRegisterForm,
};
