const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* --------------------------------- Helpers -------------------------------- */
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
// router.get('/:username/:date', userController.)
// GET /:folder/view/:date/

module.exports = router