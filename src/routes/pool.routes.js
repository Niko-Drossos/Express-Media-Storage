const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const postController = require("../controllers/postController")
/* ------------------------------- Middleware ------------------------------- */
const { upload } = require("../helpers/gridFsMethods")
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/create", upload.none(), postController.createPost)

router.post("/journal/add/:poolId", upload.none(), postController.addJournal)

router.put("/edit/:poolId", upload.none(), postController.editPost)

router.delete("/delete/:poolId", postController.deletePost)

router.get("/:poolId", postController.getPost)

module.exports = router