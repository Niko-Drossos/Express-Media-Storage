const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const voteController = require("../controllers/voteController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.pool("/pool/:poolId", voteController.voteOnPool)

router.pool("/comment/:commentId", voteController.voteOnComment)

router.pool("/user/:userId", voteController.voteOnUser)

router.pool("/video/:videoId", voteController.voteOnVideo)

router.pool("/image/:imageId", voteController.voteOnImage)

router.pool("/audio/:audioId", voteController.voteOnAudio)

module.exports = router