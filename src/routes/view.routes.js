const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const viewController = require("../controllers/viewController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/video/:filename", viewController.viewVideo)

router.get("/image/:filename", viewController.viewImage)

router.get("/audio/:filename", viewController.viewAudio)

module.exports = router