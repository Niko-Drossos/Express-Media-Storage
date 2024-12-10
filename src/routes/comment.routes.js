const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const commentController = require("../controllers/commentController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                Get comments                                */
/* -------------------------------------------------------------------------- */

router.get("/:commentId", commentController.getComments)

/* -------------------------------------------------------------------------- */
/*                            Create comment routes                           */
/* -------------------------------------------------------------------------- */

router.pool("/create/pool/:poolId", commentController.commentOnPool)

router.pool("/create/comment/:commentId", commentController.commentOnComment)

router.pool("/create/user/:userId", commentController.commentOnUser)

router.pool("/create/video/:videoId", commentController.commentOnVideo)

router.pool("/create/image/:imageId", commentController.commentOnImage)

router.pool("/create/audio/:audioId", commentController.commentOnAudio)

/* -------------------------------------------------------------------------- */
/*                             Edit comment routes                            */
/* -------------------------------------------------------------------------- */

router.put("/edit/:commentId", commentController.updateComment)

/* -------------------------------------------------------------------------- */
/*                            Delete comment routes                           */
/* -------------------------------------------------------------------------- */

router.delete("/delete/:commentId", commentController.deleteComment)

/* -------------------------------------------------------------------------- */

module.exports = router