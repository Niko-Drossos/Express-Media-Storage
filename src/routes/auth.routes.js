const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const authController = require("../controllers/authController")
/* -------------------------------------------------------------------------- */

router.post("/register", authController.registerUser)

router.post("/login", authController.loginUser)

router.get("/logout", authController.logoutUser)

module.exports = router