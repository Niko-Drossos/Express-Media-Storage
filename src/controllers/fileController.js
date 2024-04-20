// Move all file related logic to this controller
const path = require("path")  
const fs = require("fs")

/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
/* ------------------------------ Middle wares ------------------------------ */

/* --------------------------------- Helpers -------------------------------- */
const generateRouteId = require('../helpers/generateRouteId')
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

/* -------------------------- Fetch the folder path ------------------------- */

exports.retrieveFolder = (req, res) => {
  try {
    const folderContents = fs.readdirSync(req.folder)

    // Add the folder stats to the folder if they supply a date
    if (req.dateFolder) {
      const dateContents = fs.readdirSync(req.dateFolder)
      //* --------------------------- April 20 2024 02:38 -------------------------- */
      // This is the first time I have used var intentionally.
      // I think this is more efficient than using a block scoped variable
      var dateFolder = {
        date: req.params.date,
        fileCount: dateContents.length,
        contents: dateContents
      }
    }

    res.status(200).json({
      success: true,
      message: "Retrieved folder",
      data: {
        folder: req.folder,
        
        dateFolder,
        folder: {
          folderDirectories: folderContents,
          folderCount: folderContents.length
        }
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


/* ---------------------------- Upload file batch --------------------------- */

exports.batchUpload = async (req, res) => {
  try {
    // TODO: fix this taking batches but only one document
    const { title, description } = req.body

    const newVideo = await Video.create({
      title,
      description,
      uploader: req.userId,
      url: req.fileUrl
    })

    res.status(201).json({
      success: true,
      message: "Uploaded files to folder",
      data: {
        file: newVideo
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

/* ------------------------------ Stream video ------------------------------ */

exports.streamVideo = (req, res) => {
  try {
    // { }
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Check if the file exists
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return res.status(404).send('File not found');
      }

      res.status(200).json({
        success: true,
        message: "Successfully streamed video",
        data: {
          video: {
            filename,
            size: stats.size
          }
        }
      })
      
      // Set the appropriate content type for streaming
      res.setHeader('Content-Type', 'video/mp4');
      
      // Create a read stream from the file and pipe it to the response
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch folder",
      errorMessage: error.message,
      error
    })
  }
}