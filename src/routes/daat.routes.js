// Pronounced "dot"
const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const daatController = require("../controllers/daatController")
/* ------------------------------- Middleware ------------------------------- */
// const { upload } = require("../helpers/gridFsMethods")
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/ask", daatController.ask)


module.exports = router