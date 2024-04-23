const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* ------------------------------- Controllers ------------------------------ */
const searchController = require("../controllers/searchController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const createPathWithUsername = require("../models/middleware/createPathWithUsername")
const decryptJWT = require("../helpers/decryptJWT")
/* -------------- Folder middleware to create the correct path -------------- */
router.all("/*", authenticateUserJWT)

router.post("/posts", searchController.searchPosts)



module.exports = router