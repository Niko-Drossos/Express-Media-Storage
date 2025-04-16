const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
const { upload } = require('../helpers/gridFsMethods')
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// router.get("/search", userController.searchUsers)

router.get("/my-files", userController.getMyFiles)

router.get("/media-titles", userController.mediaTitles)

router.post("/follow/:userId", userController.follow)

router.post("/unfollow/:userId", userController.unfollow)

router.get("/:userId", userController.getUser)

/* ----------------------------- Profile routes ----------------------------- */
// router.post("/profile/edit", userController.editProfile)

router.post("/profile/upload-avatar", upload.single("avatar"), userController.uploadAvatar)

module.exports = router