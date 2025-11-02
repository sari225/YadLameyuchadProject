const express=require("express")
const router=express.Router()
const adminController=require("../controllers/AdminController")
const verifyJWT=require("../middleware/verifyJWT")
const verifyAdmin=require("../middleware/verifyAdmin")

router.use(verifyJWT)
router.use(verifyAdmin)

router.post("/",adminController.createAdmin)
router.get("/",adminController.getAdmins)
router.put("/:id",adminController.updateAdmin)
router.delete("/:id",adminController.deleteAdmin)

module.exports=router