/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* ------------------------------ Middle wares ------------------------------ */

/* --------------------------------- Helpers -------------------------------- */
const getVideoDetails = require('../helpers/getVideoDetails')
const getFileExt = require('../helpers/getFileExt')
const { uploadFile, retrieveFiles, streamFile, deleteFile } = require("../helpers/gridFsMethods")
/* -------------------------- Fetch the folder path ------------------------- */

/* // ! I might remove this
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
 */
/* ---------------------------- Upload file batch --------------------------- */

// ! Fix response not showing successfully uploaded files. something to do with promises.
exports.batchUpload = async (req, res) => {
  try {
    // File extensions that can be uploaded
    const acceptedVideoExt = ["mp4"]
    const acceptedImageExt = ["jpg", "jpeg", "png"] 
    const acceptedAudioExt = ["mp3", "m4a", "wav"]

    const { body } = req

    // Arrays for response to user about results
    const successfulUploads = [], failedUploads = []

    const newUploads = await req.uploads.map(async file => {
      try {
        // Get the index of the file from the fieldname that uploaded it (returns 0 - 9)
        const index = file.fieldname.split("file")[1]

        // Upload the file and return the file ID
        const uploadedFileId = await uploadFile(req, file)

        const fileExtension = getFileExt(file.originalname)
        
        // Add custom file information
        const customTitle = body[`title${index}`]
        const date = body[`date${index}`]
        const description = body[`description${index}`]

        // TODO: Create transcription function audios and videos
        if (acceptedAudioExt.includes(fileExtension) || acceptedVideoExt.includes(fileExtension)) {
          var completedTranscription = {
            status: "none",
            text: ""
          }
        }

        const documentBody = {
          title: customTitle || file.originalname.split(".").slice(0, -1).join("."),
          filename: `${req.username}-${file.originalname}`,
          user: {
            userId: req.userId,
            username: req.username
          },
          description: description || "No description",
          fileId: uploadedFileId,
          date: new Date(date)
        }

        // Create exactly one document per upload
        if (acceptedImageExt.includes(fileExtension)) {
          return await Image.create(documentBody)
        } else if (acceptedVideoExt.includes(fileExtension)) {
          // TODO: make function to determine media length with byte size
          return await Video.create({ ...documentBody, transcription: completedTranscription || "" })
        } else if (acceptedAudioExt.includes(fileExtension)) {
          return await Audio.create({ ...documentBody, transcription: completedTranscription || ""})
        }

        successfulUploads.push({ file: file.originalname })
      } catch (error) {
        // If an upload fails then add it to the failed uploads
        failedUploads.push({ file: file.originalname, error: error.message })
      }
    })
    
    // Attempt to upload all files
    await Promise.allSettled(newUploads)

    // Sort the uploads into videos, images, and audios
    let videos = [], images = [], audios = []
    successfulUploads.forEach(upload => {
      const fileExt = getFileExt(upload.filename)

      if (acceptedVideoExt.includes(fileExt)) videos.push(upload)
      else if (acceptedImageExt.includes(fileExt)) images.push(upload)
      else if (acceptedAudioExt.includes(fileExt)) audios.push(upload)
    })

    res.status(201).json({
      success: failedUploads.length ? false : true,
      message: "Uploaded files to account",
      data: {
        // separate the images and videos
        uploadedFiles: {
          images,
          videos,
          audios
        },
        failedUploads
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

/* ------------------------------ Delete files ------------------------------ */

exports.deleteFiles = async (req, res) => {
  try {
    const { deleteIds, mimetype } = req.body

    const query = {
      _id: deleteIds,
      mimetype
    }

    const deletedFile = await deleteFile(req, res, query)

    res.status(200).json({
      success: true,
      message: "Successfully deleted file",
      data: {
        deletedFile
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      errorMessage: error.message,
      error
    })
  }
}