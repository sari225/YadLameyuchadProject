const express = require("express");
const router = express.Router();
const dayCampController = require("../controllers/DayCampController");
const createUploadMiddleware = require('../middleware/upload');
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

const uploadFile = createUploadMiddleware('uploads');

router.use(verifyJWT);
// ניהול רישום ילדים
router.put("/addChildToDayCamp", dayCampController.addChildToDayCamp);
router.put("/removeChildFromDayCamp", dayCampController.removeChildFromDayCamp);


// ניהול קייטנות
router.post("/", verifyAdmin, uploadFile.single('file'), dayCampController.createDayCamp);
router.get("/", dayCampController.getDayCamps);
router.get("/:id", dayCampController.getDayCampById);
router.put("/:id", verifyAdmin, uploadFile.single('file'), dayCampController.updateDayCamp);
router.delete("/:id", verifyAdmin, dayCampController.deleteDayCamp);


module.exports = router;
