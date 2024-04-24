const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const userController = require("../controllers/userController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
router.param("folder", (req, res, next, folder) => {
  req.folder = path.join(process.cwd(), "/public/files", folder)
  next()
})
// TODO: Logging middleware, maybe
/* -------------------------------------------------------------------------- */


//! ----------------- This is not yet necessary, just testing ------------------- */
// Define route to stream MP4 file
router.get('/video/:folder/:date/:file', userController.streamVideo)
//! -------------------------------------------------------------------------- */

// TODO: Change this in the future, its to confusing for what it does
router.post("/create", userController.createFolder)
module.exports = router