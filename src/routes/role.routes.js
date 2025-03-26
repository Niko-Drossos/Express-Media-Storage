const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const roleController = require("../controllers/roleController")
/* ------------------------------- Middlewares ------------------------------ */
const isAdmin = require("../models/middleware/isAdmin")

const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

/* --------------------------- Add roles to a user -------------------------- */

router.post("/:userId/add", isAdmin, roleController.addRoles)

router.post("/:userId/remove", isAdmin, roleController.removeRoles)

/* ------------------------------ Create a role ----------------------------- */

router.post("/create", isAdmin, roleController.createRole)

/* ------------------------ Get a users current roles ----------------------- */

router.get("/:userId/get", roleController.getUserRoles)

/* -------------------------------------------------------------------------- */

module.exports = router