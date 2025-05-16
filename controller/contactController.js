const contactService = require('../service/contactService');

async function handleContactForm(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract firstName, lastName, email, subject, and message from the request body

  const { firstName, lastName, email, subject, message } = req.body;
  console.log('Incoming body:', req.body);
  
  // Check if all required fields are present
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Pass all the fields to the service for saving
    await contactService.saveContactForm({ firstName, lastName, email, subject, message });

    // Send success response
    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  handleContactForm,
};
