const express = require("express")
const router = express.Router()

const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const { upload, uploadFile, uploadMultipleFiles } = require("../helpers/fileUploading")

// Middleware to process uploaded files
const processUploads = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }

  // Store uploaded files in req.uploads array
  req.uploads = req.files.map(file => file)
  
  next()
}

router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// router.get("/get/:username", fileController.retrieveFolder)
router.get("/get/:username/:date", fileController.retrieveFolder)

router.post("/upload/folder/:username/:date", upload.array('files'), processUploads, fileController.batchUpload)

module.exports = router