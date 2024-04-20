const path = require("path")
const fs = require("fs")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
/* ------------------------------- Middleware ------------------------------- */

/* -------------------------- Create folder with id ------------------------- */

exports.createFolder = async (req, res) => {
  try {
    const { folderId } = req.body
    const folderName = path.join(process.cwd(), "/src/public/files", folderId)

    // Check if the folder already exists
    const folderExists = await new Promise((resolve) => {
      fs.stat(folderName, (err) => {
        resolve(!err)
      })
    })

    // return 409 if the folder already exists
    if (folderExists) {
      return res.status(409).json({
        success: false,
        message: "Folder already exists",
      });
    }

    // Create the users folder
    fs.mkdir(folderName, (err) => {
      if (err) {
        new Error("Folder not created for user")
      } else {
        console.log("Folder created")
      }
    })
  
    res.status(201).json({
      success: true,
      message: "Successfully created user folder!",
      data: {
        folder: folderName,
        folderId
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user folder",
      errorMessage: error.message,
      error
    })
  }
}

/* --------------------- Upload to folder with name date -------------------- */

exports.uploadToDateFolder = (req, res) => {
  try {
    const dateFolder = path.join(req.folder, req.params.date)

    // Create the users folder
    fs.mkdir(dateFolder, (err) => {
      if (err) throw new Error("Folder not created for user")
      console.log(`Folder created with date: ${req.params.date}`)
    })
    
    res.status(201).json({
      success: true,
      message: "Uploaded files to folder",
      data: {
        folder: req.folder
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch folder",
      errorMessage: error.message,
      error
    })
  }
}

exports.retrieveFolder = (req, res) => {
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
}

/* ---------------------------- Stream video feed --------------------------- */

exports.streamVideo = (req, res) => {
  const { folder, date, file } = req.params
  const filePath = path.join(process.cwd(), "/src/public/files", folder, date, file) // Specify the path to your MP4 file

  // Get file stats (to determine file size)
  const stat = fs.statSync(filePath)
  const fileSize = stat.size

  // Set the content type and range headers
  const range = req.headers.range
  const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
  }

  // If there's a range specified in the request, set the appropriate headers
  if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = (end - start) + 1
      head['Content-Range'] = `bytes ${start}-${end}/${fileSize}`
      head['Accept-Ranges'] = 'bytes'
      head['Content-Length'] = chunksize
      res.writeHead(206, head)
      fs.createReadStream(filePath, { start, end }).pipe(res)
  } else { // If no range is specified, stream the entire file
      res.writeHead(200, head)
      fs.createReadStream(filePath).pipe(res)
  }
}