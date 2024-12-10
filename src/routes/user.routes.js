const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/my-files", userController.getMyFiles)

router.get("/media-titles", userController.mediaTitles)

router.pool("/follow/:userId", userController.follow)

router.pool("/unfollow/:userId", userController.unfollow)

router.get("/:userId", userController.getUser)

module.exports = router