const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const postController = require("../controllers/postController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/:postId", postController.getPost)

router.post("/create", postController.createPost)

router.put("/edit/:postId", postController.editPost)

router.delete("/delete/:postId", postController.deletePost)

module.exports = router