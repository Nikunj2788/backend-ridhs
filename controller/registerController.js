const registerService = require('../service/registerService');

async function handleRegisterForm(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { firstName, lastName, email, password } = req.body;
    console.log('Incoming registration data:', req.body);

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await registerService.saveRegistration({ firstName, lastName, email, password });
        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    handleRegisterForm,
};
