const fs = require("fs-extra")
/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Upload = require("../models/schemas/Upload")
const Audio = require("../models/schemas/Audio")
/* ------------------------------ Middle wares ------------------------------ */
const logError = require("../models/middleware/logging/logError");
/* --------------------------------- Helpers -------------------------------- */
const getFileDetails = require('../helpers/getFileDetails')
const getFileExt = require('../helpers/getFileExt')
const { uploadFile, retrieveFiles, streamFile, deleteFile, uploadChunk, startChunkedUpload } = require("../helpers/gridFsMethods")
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

/* ------------------------- Start a chunked upload ------------------------- */

exports.startChunkUpload = async (req, res) => {
  try {
    const { metadata } = req.body

    // Generate a unique file name to send back to the client for uploading
    req.generatedFileName = `${Date.now()}-${metadata.fileName}`

    const { uploadStream, fileId, documentId } = await startChunkedUpload(req, res)
    
    // Create a document for the file
    let document
    let documentBody = {
      // I set the document _id so that it is initialized when you start the upload.
      // I do this to prevent having to send the document _id back to the client
      _id: documentId,
      title: metadata.title || metadata.fileName.split(".").slice(0, -1).join("."),
      filename: `${req.userId}-${metadata.fileName}`,
      description: metadata.description || "",
      fileId: fileId,
      date: metadata.date ? new Date(metadata.date) : Date.now(),
      privacy: metadata.privacy,
      user: req.userId,
      tags: metadata.tags ? metadata.tags.split(",") : [],
      status: "uploading",
      mediaType: metadata.mediaType
    }

    try {
      /* switch (mimeType) {
        case "image":
          document = await Upload.create(documentBody).catch(err => new Error("Error creating image document"))
          break;
        case "video":
          document = await Video.create(documentBody).catch(err => new Error("Error creating video document"))
          break;
        case "audio":
          document = await Audio.create(documentBody).catch(err => new Error("Error creating audio document"))
          break;
      } */
          document = await Upload.create(documentBody).catch(err => new Error("Error creating image document"))

    } catch (error) {
      console.log(error)
      await logError(req, error)
      return res.status(500).json({
        success: false,
        message: "Failed to create document for file",
        errorMessage: error.message,
        error
      })
    }

    res.status(200).json({
      success: true,
      message: "Initialized chunked upload",
      data: {
        ext: getFileExt(metadata.fileName),
        fileId: fileId // Return the file ID to the client for uploading
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to start chunked upload",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------- Chunked file uploading ------------------------- */

exports.chunkedUpload = async (req, res) => {
  try {
    const message = await uploadChunk(req, res)
    return message
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to chunked upload",
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      errorMessage: error.message,
      error
    })
  }
}