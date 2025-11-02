const express = require("express");
const router = express.Router();
const updatingController = require("../controllers/UpdateController")
const verifyJWT=require("../middleware/verifyJWT")
const verifyAdmin=require("../middleware/verifyAdmin")
const createUploadMiddleware = require("../middleware/upload"); // המידלוור שלך ל־multer
router.use(verifyJWT);
// יוצרים מידלוור להעלאה בתיקיה 'updatings'
const uploadFile = createUploadMiddleware("updatings");

// יצירת עדכון חדש עם קובץ
router.post("/", verifyAdmin, uploadFile.single("file"), updatingController.createUpdating);

// שליפת כל העדכונים
router.get("/", updatingController.getUpdatings);

// שליפת עדכון לפי ID
router.get("/:id", updatingController.getUpdatingById);

// עדכון עדכון קיים (כולל אפשרות להעלות קובץ חדש)
router.put("/:id", verifyAdmin, uploadFile.single("file"), updatingController.updateUpdating);

// מחיקת עדכון
router.delete("/:id", verifyAdmin, updatingController.deleteUpdating);

module.exports = router;
