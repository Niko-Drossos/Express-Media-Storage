const fs = require("fs-extra")
const path = require("path")
const os = require("os")
const ffmpeg = require('fluent-ffmpeg')
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
    
    // Generate unique upload ID
    const uploadId = `${req.userId}-${Date.now()}`
    
    // Create temporary file path
    const tempFilePath = path.join(os.tmpdir(), `${uploadId}-${metadata.fileName}`)
    
    // Initialize upload session data
    if (!req.session.uploads) {
      req.session.uploads = {}
    }
    
    // Store upload metadata in session
    req.session.uploads[uploadId] = {
      tempFilePath,
      fileName: metadata.fileName,
      totalChunks: metadata.totalChunks,
      receivedChunks: 0,
      startTime: Date.now(),
      metadata: metadata
    }

    // Create the document as before
    let documentBody = {
      _id: documentId,
      title: metadata.title || metadata.fileName.split(".").slice(0, -1).join("."),
      filename: `${req.userId}-${metadata.fileName}`,
      description: metadata.description || "",
      fileId: uploadId,
      date: metadata.date ? new Date(metadata.date) : Date.now(),
      privacy: metadata.privacy,
      user: req.userId,
      tags: metadata.tags ? metadata.tags.split(",") : [],
      status: "uploading",
      mediaType: metadata.mediaType
    }

    const document = await Upload.create(documentBody)

    res.status(200).json({
      success: true,
      message: "Initialized chunked upload",
      data: {
        uploadId,
        ext: getFileExt(metadata.fileName),
        fileId: document._id
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to start chunked upload",
      error: error.message
    })
  }
}

/* ------------------------- Chunked file uploading ------------------------- */

exports.chunkedUpload = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks } = req.body
    
    // Validate session and upload data
    if (!req.session.uploads || !req.session.uploads[uploadId]) {
      throw new Error('Upload session not found')
    }

    const uploadSession = req.session.uploads[uploadId]
    const tempFilePath = uploadSession.tempFilePath

    // Append chunk to temporary file
    await fs.appendFile(tempFilePath, req.file.buffer)
    
    // Update received chunks count
    uploadSession.receivedChunks++
    
    // If this is the last chunk
    if (uploadSession.receivedChunks === parseInt(totalChunks)) {
      // Process the complete file
      await processCompleteFile(tempFilePath, uploadId, req, res)
      
      // Clean up session data
      delete req.session.uploads[uploadId]
    } else {
      res.status(200).json({
        success: true,
        message: "Chunk uploaded successfully",
        progress: {
          received: uploadSession.receivedChunks,
          total: totalChunks
        }
      })
    }
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to process chunk",
      error: error.message
    })
  }
}

// Add a cleanup function for abandoned uploads
async function cleanupAbandonedUploads() {
  try {
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const now = Date.now()

    // Find expired sessions in MongoDB
    const expiredSessions = await store.collection.find({
      'session.uploads': { $exists: true },
      'expires': { $lt: new Date(now) }
    })

    for (const session of await expiredSessions.toArray()) {
      const uploads = session.session.uploads
      
      // Clean up temporary files
      for (const uploadId in uploads) {
        try {
          await fs.unlink(uploads[uploadId].tempFilePath)
          
          // Update associated document status
          await Upload.findOneAndUpdate(
            { fileId: uploadId },
            { status: 'failed', error: 'Upload abandoned' }
          )
        } catch (err) {
          console.error(`Failed to cleanup upload ${uploadId}:`, err)
        }
      }
    }
  } catch (error) {
    console.error('Failed to cleanup abandoned uploads:', error)
  }
}

// Run cleanup every hour
setInterval(cleanupAbandonedUploads, 60 * 60 * 1000)

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