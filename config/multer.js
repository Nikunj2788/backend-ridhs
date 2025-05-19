// const path = require('path');
// const multer = require('multer');

// // Configure multer for disk storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '..', 'uploads'));
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//     }
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 10 * 1024 * 1024 }
// });

// module.exports = upload;


const multer = require('multer');

// Store files in memory (not on disk)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

module.exports = upload;
