const express = require('express')
const router = express.Router()
const messageController = require('../controllers/MessageController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyAdmin = require('../middleware/verifyAdmin')

// יצירת הודעה - פתוח לאורחים ומחוברים
router.post('/', messageController.createMessage)

// שאר הפעולות רק למנהלים/משתמשים מאומתים
router.get('/', verifyJWT, verifyAdmin, messageController.getAllMessages)
router.get('/:id', verifyJWT, verifyAdmin, messageController.getMessageById)
router.put('/:id', verifyJWT, verifyAdmin, messageController.markAsRead)
router.delete('/:id', verifyJWT, verifyAdmin, messageController.deleteMessage)
router.post('/reply', verifyJWT, verifyAdmin, messageController.replyToMessage)

module.exports = router
