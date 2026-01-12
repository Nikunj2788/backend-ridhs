const registerService = require('../service/registerService');

async function handleRegisterForm(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Extract roleId along with other fields
  const { firstName, lastName, email, password, roleId } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const finalRoleId = roleId || 3;

    await registerService.saveRegistration({
      firstName,
      lastName,
      email,
      password,
      role_id: finalRoleId
    });

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error.message);

    if (error.message.includes('already registered')) {
      return res.status(409).json({ message: 'Email already registered' });
    } else if (error.message.includes('Invalid email')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  handleRegisterForm,
};
