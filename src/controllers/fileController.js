/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
/* ------------------------------ Middle wares ------------------------------ */

/* --------------------------------- Helpers -------------------------------- */
const getVideoDetails = require('../helpers/getVideoDetails')
const getFileExt = require('../helpers/getFileExt')
const { uploadFile, retrieveFiles, streamFile } = require("../helpers/fileUploading")
/* -------------------------- Fetch the folder path ------------------------- */

exports.findFiles = async (req, res) => {
  try {
    const query = {
      mimetype: req.query.mimetype,
      date: req.params.date || null
    }

    const retrievedFiles = await retrieveFiles(req, res, query)

    res.status(200).json({
      success: true,
      message: "Retrieved files",
      data: {
        retrievedFiles
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
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

    const { date } = req.params
    
    const newUploads = req.uploads.map(async file => {
      const uploadedFileId = await uploadFile(req, res, file)

      const fileExtension = getFileExt(file.originalname)
      
      const documentBody = {
        title: file.originalname,
        filename: file.originalname,
        uploader: req.userId,
        description: "",
        fileId: uploadedFileId,
        date: new Date(date)
      }

      // Create exactly one document per upload
      if (acceptedImageExt.includes(fileExtension)) {
        return await Image.create(documentBody)
      } else if (acceptedVideoExt.includes(fileExtension)) {
        // TODO: make function to determine media length with byte size
        return await Video.create({ ...documentBody })
      } else if (acceptedAudioExt.includes(fileExtension)) {
        return await Audio.create({ ...documentBody })
      }
    })

    const finishedUploads = await Promise.all(newUploads)

    // Sort the uploads into videos, images, and audios
    let videos = [], images = [], audios = []
    finishedUploads.map(upload => {
      const { title } = upload

      if (acceptedVideoExt.includes(getFileExt(title))) videos.push(upload)
      if (acceptedImageExt.includes(getFileExt(title))) images.push(upload)
      if (acceptedAudioExt.includes(getFileExt(title))) audios.push(upload)
    })

    res.status(201).json({
      success: true,
      message: "Uploaded files to folder",
      data: {
        uploadedFiles: {
          // separate the images and videos
          images,
          videos,
          audios
        },
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload files",
      errorMessage: error.message,
      error
    })
  }
}