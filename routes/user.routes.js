const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")

// Folder middleware to create the correct path
router.param("folder", (req, res, next, folder) => {
  req.folder = path.join(process.cwd(), "/public/files", folder)
  /* fs.readdir(req.folder, (req, res, files) => {
    console.log(files)
  }) */
  /* fs.rmdir(req.folder, (req, res, next, files) => {
    console.log(files)
  }) */
  next()
})

// TODO: Logging middleware

//! ------------------------------- COPY ROUTE ------------------------------- */
/* router.post("/", (req, res) => {
  try {
    res.status(200)
    res.json({
      success: true,
      message: "",
      data: {

      }
    })
  } catch (error) {
    res.status(500)
    res.json({
      success: false,
      message: "",
      errorMessage: error.message,
      error
    })
  }
}) */

//! ------------------------ This is not yet necessary ----------------------- */

router.get("/", (req, res) => {
  res.json({
    name: path.join(process.cwd(), "/public/files")
  })
})

//! -------------------------------------------------------------------------- */

router.post("/create", (req, res) => {
  try {
    console.log(req.body)
    const username = req.body.username
    const folderName = path.join(process.cwd(), "/public/files", username)

    // Create the users folder
    fs.mkdir(folderName, (err) => {
      if (err) throw new Error("Folder not created for user")
      console.log("Folder created")
    })

    res.status(200)
    res.json({
      success: true,
      message: "Successfully created user folder!",
      data: {

      }
    })
  } catch (error) {
    res.status(500)
    res.json({
      success: false,
      message: "Failed to create user",
      errorMessage: error.message,
      error
    })
  }
})

/* -------------------------------------------------------------------------- */

// Currently this just returns the folder path 
router.get("/:folder", (req, res) => {
  try {
    res.status(200)
    res.json({
      success: true,
      message: "Retrieved folder path",
      data: {
        folder: req.folder
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
})

/* -------------------------------------------------------------------------- */
// TODO: Make this accept FormData object
router.post("/:folder/upload/:date", (req, res) => {
  try {
    console.log(req)

    const dateFolder = path.join(req.folder, req.params.date)

    // Create the users folder
    fs.mkdir(dateFolder, (err) => {
      if (err) throw new Error("Folder not created for user")
      console.log(`Folder created with date: ${req.params.date}`)
    })
    
    res.status(200)
    res.json({
      success: true,
      message: "Uploaded files to folder",
      data: {
        folder: req.folder
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
}) 

/* -------------------------------------------------------------------------- */

router.get("/:folder", (req, res) => {
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
})

/* -------------------------------------------------------------------------- */

router.get("/:folder/view", (req, res) => {
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
})

/* -------------------------------------------------------------------------- */

// GET /:folder/view/:date/

module.exports = router