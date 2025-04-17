const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const searchController = require("../controllers/searchController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------- Folder middleware to create the correct path -------------- */

router.get("/users", searchController.searchUsers)

router.get("/pools", searchController.searchPools)

router.get("/comments", searchController.searchComments)

router.get("/uploads", searchController.searchUploads)

/* router.get("/videos", searchController.searchVideos)

router.get("/images", searchController.searchImages)

router.get("/audios", searchController.searchAudios) */

module.exports = router