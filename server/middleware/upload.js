const multer = require('multer')
const createUploadMiddleware = (folderName) => {

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname + `/../public/${folderName}`),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + '-' + file.originalname)
  },
  limits: { fileSize: 5 * 1024 * 1024 } 

})

const upload = multer({ storage })
  return upload

}

module.exports = createUploadMiddleware
