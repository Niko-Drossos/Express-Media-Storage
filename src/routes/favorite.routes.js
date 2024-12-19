const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const favoriteController = require("../controllers/favoriteController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/video/:videoId", favoriteController.favoriteVideo)

router.post("/image/:imageId", favoriteController.favoriteImage)

router.post("/audio/:audioId", favoriteController.favoriteAudio)

router.post("/comment/:commentId", favoriteController.favoriteComment)

router.post("/pool/:poolId", favoriteController.favoritePool)

module.exports = router