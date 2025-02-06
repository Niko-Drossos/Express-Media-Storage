const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const poolController = require("../controllers/poolController")
/* ------------------------------- Middleware ------------------------------- */
const { upload } = require("../helpers/gridFsMethods")
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/create", upload.none(), poolController.createPool)

router.post("/journal/add", upload.none(), poolController.addJournal)

router.put("/edit/:poolId", upload.none(), poolController.editPool)

router.delete("/delete/:poolId", poolController.deletePool)

router.get("/:poolId", poolController.getPool)

module.exports = router