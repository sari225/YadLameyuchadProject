const express = require('express')
const router = express.Router()
const volunteerController = require('../controllers/VolunteerController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyAdmin = require('../middleware/verifyAdmin')

router.use(verifyJWT)
router.use(verifyAdmin)

// פעולות על מועדוניות בתוך מתנדב
router.put('/:volunteerId/updateClub/:clubId', volunteerController.updateClubInVolunteer)
router.delete('/:volunteerId/removeClub/:clubId', volunteerController.removeClubFromVolunteer)
router.put('/addClubToVolunteer/:volunteerId', volunteerController.addClubToVolunteer)

// CRUD בסיסי למתנדבים
router.post('/', volunteerController.createVolunteer)
router.get('/', volunteerController.getVolunteers)
router.get('/:id', volunteerController.getVolunteerById)
router.put('/:id', volunteerController.updateVolunteer)
router.delete('/:id', volunteerController.deleteVolunteer)


module.exports = router
 