const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const commentController = require("../controllers/commentController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/create/post/:postId", commentController.commentOnPost)

router.post("/create/comment/:commentId", commentController.commentOnComment)

router.post("/create/user/:userId", commentController.commentOnUser)

router.post("/create/video/:videoId", commentController.commentOnVideo)

router.post("/create/image/:imageId", commentController.commentOnImage)

router.post("/create/audio/:audioId", commentController.commentOnAudio)

module.exports = router