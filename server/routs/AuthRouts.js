const express=require("express")
const router=express.Router()
const authContoller=require("../controllers/authContoller")

router.post("/",authContoller.registerChild)
router.put("/",authContoller.verifyOTP)
router.put("/forgotPassword",authContoller.forgotPassword)
router.put("/:id",authContoller.approveChild)
router.post("/login",authContoller.login)

module.exports=router