const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
// const manageController = require("../controllers/manageController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// Routes to manage:
// Bulk actions (ex: favorite/unfavorite, delete, privacy settings)
// Search page for your media, items you favorited, items you voted +/- on, etc 

// router.

module.exports = router