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
/* -------------- Folder middleware to create the correct path -------------- */
router.all("/*", authenticateUserJWT)
router.param("username", createPathWithUsername)

// Define a custom destination function for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Use req.params.folderName to dynamically determine the upload location
    const folderName = req.params.folder || 'defaultFolder'
    const folderDate = req.params.date || 'defaultDate'
    const uploadPath = path.join(process.cwd(), `uploads/`, folderName, folderDate)

    // Create the folder if it doesn't exist
    try {
      // const folderStats = fs.statSync(uploadPath)
      const folderStats = fs.statSync(uploadPath)

    } catch (error) {
      console.log(error)
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    req.fileUrl = path.join(uploadPath, file.originalname)

    cb(null, uploadPath)
  },
  filename: function(req, file, cb) {
    // You can customize the filename if needed
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

/* -------------------------------------------------------------------------- */

// router.post("/upload-single/:folder/:date/", upload.single('file'), fileController.uploadToDateFolder)
router.get("/get-folder/:username", fileController.retrieveFolder)
router.get("/get-folder/:username/:date", fileController.retrieveFolder)
router.post("/upload-batch/folder/:username/:date/", upload.array('files'), fileController.batchUpload)
router.get("/stream-video/:username/:date/:fileId", fileController.streamVideo)

module.exports = router