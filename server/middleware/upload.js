const multer = require('multer')

// Allowed file types: images, PDF, and videos
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // PDF
  'application/pdf',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
];

const createUploadMiddleware = (folderName) => {

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname + `/../public/${folderName}`),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('סוג קובץ לא נתמך. ניתן להעלות רק תמונות, PDF וסרטונים'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024  // 50MB limit for videos
  } 
})
  return upload

}

module.exports = createUploadMiddleware
