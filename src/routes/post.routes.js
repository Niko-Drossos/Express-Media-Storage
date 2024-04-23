const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* ------------------------------- Controllers ------------------------------ */
const postController = require("../controllers/postController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
/* -------------- Folder middleware to create the correct path -------------- */
router.all("/*", authenticateUserJWT)

router.post("/create", postController.createPost)

router.put("/edit/:postId", postController.editPost)

// create update post route

module.exports = router