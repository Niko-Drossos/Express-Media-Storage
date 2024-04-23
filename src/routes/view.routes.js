const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const viewController = require("../controllers/viewController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/post/:postId", viewController.viewPost)

router.get("/comment/:commentId", viewController.viewComment)

router.get("/video/:videoId", viewController.viewVideo)

router.get("/image/:imageId", viewController.viewImage)

router.get("/audio/:audioId", viewController.viewAudio)

// Maybe add a view route for users? this might be in the users route
// router.get("/user/:userId", viewController.viewUser)

module.exports = router