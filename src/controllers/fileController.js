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
    const date = req.params.date 
    if (date) {
      const dateContents = fs.readdirSync(`${req.folder}/${date}`)
      // * --------------------------- April 20 2024 02:38 -------------------------- 
      // This is the first time I have used var intentionally.
      // I think this is more efficient than using a block scoped variable
      var dateFolder = {
        date,
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
    const acceptedVideoExt = ["mp4"]
    const acceptedImageExt = ["jpg", "jpeg", "png", "webp"] 
    const acceptedAudioExt = ["mp3", "m4a", "wav"]

    const newUploads = req.uploads.map(async file => {
      const fileExtension = getFileExt(file.originalname)
      const fileDetails = await getVideoDetails(file.path)

      const { width, height } = fileDetails.streams[0]
      const documentBody = {
        dimensions: {
          width, 
          height
        },
        uploader: req.userId,
        title: file.originalname,
        description: "",
        url: file.path,
        fileSize: file.size,
      }

      // Create exactly one document per upload
      if (acceptedImageExt.includes(fileExtension)) {
        return await Image.create(documentBody)
      } else if (acceptedVideoExt.includes(fileExtension)) {
        return await Video.create({ ...documentBody, length: fileDetails.format.duration })
      } else if (acceptedAudioExt.includes(fileExtension)) {
        return await Audio.create({ ...documentBody, length: fileDetails.format.duration })
      }
    })
    
    const completedUploads = await Promise.all(newUploads)

    // Sort the uploads into videos, images, and audios
    let videos = [], images = [], audios = [];
    completedUploads.map(upload => {
      if (acceptedVideoExt.includes(getFileExt(upload.url))) videos.push(upload)
      if (acceptedImageExt.includes(getFileExt(upload.url))) images.push(upload)
      if (acceptedAudioExt.includes(getFileExt(upload.url))) audios.push(upload)
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