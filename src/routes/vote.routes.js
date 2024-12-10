const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const voteController = require("../controllers/voteController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/post/:poolId", voteController.voteOnPool)

router.post("/comment/:commentId", voteController.voteOnComment)

router.post("/user/:userId", voteController.voteOnUser)

router.post("/video/:videoId", voteController.voteOnVideo)

router.post("/image/:imageId", voteController.voteOnImage)

router.post("/audio/:audioId", voteController.voteOnAudio)

module.exports = router