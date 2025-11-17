const express = require('express')
const router = express.Router()
const documentController = require('../controllers/DocumentController')
const createUploadMiddleware = require('../middleware/upload');


const verifyJWT = require('../middleware/verifyJWT')
const verifyAdmin = require('../middleware/verifyAdmin')

const uploadFile = createUploadMiddleware('documents');

router.use(verifyJWT)

// יצירת מסמך עם קובץ
router.post('/', verifyAdmin, uploadFile.single('document'), documentController.createDocument)
// שליפת כל המסמכים
router.get('/', documentController.getAllDocuments)
// שליפת מסמך לפי מזהה
router.get('/:id', documentController.getDocumentById)
// מחיקת מסמך
router.delete('/:id', verifyAdmin, documentController.deleteDocument)

module.exports = router
