const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const poolController = require("../controllers/poolController")
// const imageController
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// router.

module.exports = router