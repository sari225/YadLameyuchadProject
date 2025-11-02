const express=require("express")
const router=express.Router()
const childController=require("../controllers/ChildController")
const verifyJWT=require("../middleware/verifyJWT")
const verifyAdmin=require("../middleware/verifyAdmin")
router.use(verifyJWT)
router.post("/",verifyAdmin,childController.createChild)
router.get("/",verifyAdmin,childController.getChildren)
router.get("/:id",childController.getChildById)
router.put("/",childController.updatePassword)
router.put("/:id",childController.updateChild)
router.delete("/:id",childController.deleteChild)

module.exports=router