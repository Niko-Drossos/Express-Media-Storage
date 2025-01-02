const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const suggestController = require("../controllers/suggestController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/usernames", suggestController.usernames)

// Allow for searching different collections and their tags
router.get("/:collection/tags", suggestController.tags)

module.exports = router