const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Load your Google service account key
const KEYFILEPATH = path.join(__dirname, 'google-service-account.json'); // adjust if stored elsewhere

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Replace with your actual Google Drive folder ID (must be shared with the service account)
const FOLDER_ID = '1AJna1CNph_AQ3GzJZmwq8pTAdDe-B17t'; // ⚠️ Required

async function uploadToDrive(file) {
    const tempFilePath = path.join(os.tmpdir(), file.originalname);
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

    // Make file publicly viewable
    await drive.permissions.create({
        fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return {
        id: fileId,
        directUrl: `https://lh3.googleusercontent.com/d/${fileId}=s1000`, // Thumbnail URL
        shareableUrl: `https://drive.google.com/uc?export=view&id=${fileId}` // Direct download URL
    };
}

module.exports = { uploadToDrive };
