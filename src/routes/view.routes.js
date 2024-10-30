const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const viewController = require("../controllers/viewController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/video/:fileId", viewController.viewVideo)

router.get("/image/:fileId", viewController.viewImage)

router.get("/audio/:fileId", viewController.viewAudio)

module.exports = router