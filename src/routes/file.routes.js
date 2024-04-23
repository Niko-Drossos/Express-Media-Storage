const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const createPathWithUsername = require("../models/middleware/createPathWithUsername")
// const addDateToUrl = require("../models/middleware/addDateToUrl")
const decryptJWT = require("../helpers/decryptJWT")
/* -------------- Folder middleware to create the correct path -------------- */
router.all("/*", authenticateUserJWT)
router.param("username", createPathWithUsername)

// Define a custom destination function for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const userPayload = decryptJWT(req.headers.authorization).payload

    const folderName = userPayload.folderId || 'defaultFolder'
    const folderDate = req.params.date || 'defaultDate'
    const uploadPath = path.join(process.cwd(), `uploads/`, folderName, folderDate)

    // Create the folder if it doesn't exist
    try {
      fs.statSync(uploadPath)
    } catch (error) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: function(req, file, cb) {
    // You can customize the filename if needed
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

// Middleware to process uploaded files
const processUploads = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }

  // Store uploaded files in req.uploads array
  req.uploads = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    path: file.path, // Temporary path where the file was uploaded
    size: file.size
  }))

  next()
}

/* -------------------------------------------------------------------------- */

router.get("/get/:username", fileController.retrieveFolder)
router.get("/get/:username/:date", fileController.retrieveFolder)

// router.put("/edit/:folder/:date/:fileId", upload.single('file'), fileController.uploadToDateFolder)

router.post("/upload/folder/:username/:date", upload.array('files'), processUploads, fileController.batchUpload)

router.get("/stream-video/:username/:date/:fileId", fileController.streamVideo)

module.exports = router