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

router.post("/create/pool/:poolId", commentController.commentOnPool)

router.post("/create/comment/:commentId", commentController.commentOnComment)

router.post("/create/user/:userId", commentController.commentOnUser)

router.post("/create/upload/:uploadId", commentController.commentOnUpload)

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