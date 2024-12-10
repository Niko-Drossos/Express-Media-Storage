const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const postController = require("../controllers/poolController")
/* ------------------------------- Middleware ------------------------------- */
const { upload } = require("../helpers/gridFsMethods")
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/create", upload.none(), postController.createPool)

router.post("/journal/add/:poolId", upload.none(), postController.addJournal)

router.put("/edit/:poolId", upload.none(), postController.editPool)

router.delete("/delete/:poolId", postController.deletePool)

router.get("/:poolId", postController.getPool)

module.exports = router