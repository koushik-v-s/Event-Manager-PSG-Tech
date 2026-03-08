const multer = require('multer');

// Use memory storage to avoid saving files to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit each file to 2MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types 
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF allowed.'), false);
    }
  },
});

module.exports = upload;