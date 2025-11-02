const express=require("express")
const router=express.Router()
const clubController=require("../controllers/ClubController")
const verifyJWT=require("../middleware/verifyJWT")
const verifyAdmin=require("../middleware/verifyAdmin")

router.use(verifyJWT)
router.post("/",verifyAdmin,clubController.createClub)
router.get("/",clubController.getClubs)
router.get("/:id",clubController.getClubById)
router.delete("/:id",verifyAdmin,clubController.deleteClub)
router.put("/addChildToClub",verifyAdmin,clubController.addChildToClub)
router.put("/Refuse",verifyAdmin,clubController.Refuse)
router.put("/removeChildFromClub/:id",verifyAdmin,clubController.removeChildFromClub)
router.put("/:id",verifyAdmin,clubController.updateClub)

module.exports=router