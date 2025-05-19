const path = require('path');
const fs = require('fs');
const os = require('os');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = '1AJna1CNph_AQ3GzJZmwq8pTAdDe-B17t';

async function uploadToDrive(file) {
    const tempFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName); // ✅ safe path

    try {
        // Write to a writable temporary directory
        fs.writeFileSync(tempFilePath, file.buffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.originalname,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(tempFilePath),
            },
        });

        const fileId = response.data.id;

        // Make file public
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            id: fileId,
            directUrl: `https://lh3.googleusercontent.com/d/${fileId}=s1000`,
            shareableUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
        };
    } finally {
        // Cleanup: safely delete temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}
module.exports = { uploadToDrive };
