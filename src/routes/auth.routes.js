const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const authController = require("../controllers/authController")
/* -------------------------------------------------------------------------- */

router.pool("/register", authController.registerUser)
router.pool("/login", authController.loginUser)

module.exports = router