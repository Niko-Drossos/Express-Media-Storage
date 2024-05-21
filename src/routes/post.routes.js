const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const postController = require("../controllers/postController")
/* ------------------------------- Middleware ------------------------------- */
const { upload } = require("../helpers/gridFsMethods")
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/:postId", postController.getPost)

router.post("/create", upload.none(), postController.createPost)

router.post("/journal/add/:postId", upload.none(), postController.addJournal)

router.put("/edit/:postId", upload.none(), postController.editPost)

router.delete("/delete/:postId", postController.deletePost)

module.exports = router