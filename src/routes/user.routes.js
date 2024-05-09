const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */

// TODO: Logging middleware, maybe
/* -------------------------------------------------------------------------- */

router.get("/:userId", userController.getUser)


module.exports = router