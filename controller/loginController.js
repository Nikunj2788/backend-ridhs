const loginService = require('../service/loginService');
const bcrypt = require('bcrypt');

async function handleLoginForm(req, res) {
    console.log('✅ handleLoginForm called');

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await loginService.getUserByEmail(email);

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('✅ User authenticated');
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.first_name,
                email: user.email,
                role_id: user.role_id
            }
        });

    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    handleLoginForm,
};
