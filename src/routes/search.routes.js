const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* ------------------------------- Controllers ------------------------------ */
const searchController = require("../controllers/searchController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------- Folder middleware to create the correct path -------------- */

router.get("/posts", searchController.searchPosts)

// Add later
// router.get("/videos", searchController.searchPosts)
// router.get("/images", searchController.searchPosts)
// router.get("/audios", searchController.searchPosts)

module.exports = router