const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* -------------------------------------------------------------------------- */

/* -------------- Folder middleware to create the correct path -------------- */
router.param("folder", (req, res, next, folder) => {
  req.folder = path.join(process.cwd(), "/public/files", folder)
  next()
})

// TODO: Logging middleware

//! ----------------- This is not yet necessary, just testing ------------------- */

// Define route to stream MP4 file
router.get('/video/:folder/:date/:file', userController.streamVideo)
//! -------------------------------------------------------------------------- */

router.post("/create", userController.createFolder)
// TODO: Make this accept FormData object
router.get("/:folder", userController.retrieveFolder)
router.post("/:folder/upload/:date", userController.uploadToDateFolder) 


// Not yet sure if this is necessary
/* router.get("/:folder/view", (req, res) => {
  try {
    res.status(200)
    res.json({
      success: true,
      message: "Retrieved folder",
      data: {
        folder: req.folder,
        fileCount: "Something",
        folderCount: "Something"
      }
    })
  } catch (error) {
    res.status(500)
    res.json({
      success: false,
      message: "Failed to fetch folder",
      errorMessage: error.message,
      error
    })
  }
}) */

// GET /:folder/view/:date/

module.exports = router