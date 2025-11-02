const express=require("express")
const router=express.Router()
const verifyJWT=require("../middleware/verifyJWT")
const verifyAdmin=require("../middleware/verifyAdmin")
const clubRequestController=require("../controllers/ClubRequestController")

router.use(verifyJWT)


router.post("/",clubRequestController.createClubRequest)
router.get("/",verifyAdmin,clubRequestController.getAllClubRequests)
router.get("/:id",verifyAdmin,clubRequestController.getClubRequestById)
router.delete("/:id",verifyAdmin,clubRequestController.deleteClubRequest)

module.exports=router