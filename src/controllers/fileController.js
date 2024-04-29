const path = require("path")  
const fs = require("fs")

/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
/* ------------------------------ Middle wares ------------------------------ */

/* --------------------------------- Helpers -------------------------------- */
const getVideoDetails = require('../helpers/getVideoDetails')
const getFileExt = require('../helpers/getFileExt')
const { uploadFile, retrieveFiles, streamFile } = require("../helpers/fileUploading")

/* -------------------------- Fetch the folder path ------------------------- */

exports.retrieveFolder = async (req, res) => {
  try {
    const query = {
      mimetype: req.query.mimetype,
      date: req.params.date || null
    }

    const retrievedFiles = await retrieveFiles(req, res, query)

    res.status(200).json({
      success: true,
      message: "Retrieved folder",
      data: {
        retrievedFiles
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
    
    const completedUploads = req.uploads.map(async file => {
      const uploadedFile = await uploadFile(req, res, file)

      const fileExtension = getFileExt(file.originalname)
      
      const documentBody = {
        filename: file.originalname,
        uploader: req.userId,
        description: "",
        fileId: uploadedFile
      }

      console.log("Finished upload")

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

    // const completedUploads = await Promise.all(newUploads)

    // Sort the uploads into videos, images, and audios
    /* let videos = [], images = [], audios = [];
    completedUploads.map(upload => {
      if (acceptedVideoExt.includes(getFileExt(upload.url))) videos.push(upload)
      if (acceptedImageExt.includes(getFileExt(upload.url))) images.push(upload)
      if (acceptedAudioExt.includes(getFileExt(upload.url))) audios.push(upload)
    }) */

    res.status(201).json({
      success: true,
      message: "Uploaded files to folder",
      data: {
        uploadedFiles: {
          // separate the images and videos
          /* images,
          videos,
          audios */
        },
        completedUploads: await completedUploads
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

/* ------------------------------ Stream video ------------------------------ */

exports.streamVideo = (req, res) => {
  try {
    const filename = req.params.filename;

    streamFile(req, res, filename)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch folder",
      errorMessage: error.message,
      error
    })
  }
}