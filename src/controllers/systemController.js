/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* -------------------------------------------------------------------------- */

const { acceptUploads } = require('../models/middleware/allowUploads')
const { uploadStreams } = require('../helpers/gridFsMethods')

/* -------------------- Search usernames for autocomplete ------------------- */

const stopUploads = async (req, res) => {
  try {
    // ! TEMPORARY HARD CODED VALUE FOR ADMINS
    if (req.userId !== "67a2b84f1e078206cff94f55" && req.userId !== "67d9fa0419922ebfc40ab164") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to stop uploads",
        errorMessage: "You don't have permission to stop uploads, you must be an admin",
        error: "You don't have permission to stop uploads"
      })
    }

    acceptUploads.allow = false
    acceptUploads.reason = req.body.reason || "Admin stopped uploads"

    res.status(200).json({
      success: true,
      message: "Stopped new uploads from being created",
      data: {
        acceptUploads
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to stop uploads to server",
      errorMessage: error.message,
      error
    })   
  }
}

/* --------------------------- Start new uploads --------------------------- */

const startUploads = async (req, res) => {
  try {
    // ! TEMPORARY HARD CODED VALUE FOR ADMINS
    if (req.userId !== "67a2b84f1e078206cff94f55" && req.userId !== "67d9fa0419922ebfc40ab164") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to stop uploads",
        errorMessage: "You don't have permission to stop uploads, you must be an admin",
        error: "You don't have permission to stop uploads"
      })
    }

    acceptUploads.allow = true
    acceptUploads.reason = req.body.reason || "Admin enabled uploads"

    res.status(200).json({
      success: true,
      message: "Allowed new uploads to server",
      data: {
        acceptUploads
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to allow uploads to server",
      errorMessage: error.message,
      error
    })   
  }
}

/* ----------------------- Show current upload status ----------------------- */

const uploadStatus = async (req, res) => {
  try {
    console.log()
    // ! TEMPORARY HARD CODED VALUE FOR ADMINS
    if (req.userId !== "67a2b84f1e078206cff94f55" && req.userId !== "67d9fa0419922ebfc40ab164") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view upload status",
        errorMessage: "You don't have permission to view upload status",
        error: "You don't have permission to view upload status"
      })
    }
    
    // Return an array of all ongoing uploads
    const currentStreams = Array.from(uploadStreams.keys()).map(fileId => {
      const stream = uploadStreams.get(fileId)
      return {
        fileId,
        mimeType: stream.mimeType,
        filename: stream.uploadStream.filename,
        uploadStartedAt: new Date(stream.uploadStartedAt).toLocaleString(),
        done: stream.uploadStream.done
      }
    })

    res.status(200).json({
      success: true,
      message: "Returned upload status",
      data: {
        totalUploads: currentStreams.length,
        acceptUploads,
        uploadStreams: currentStreams
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to view uploads on server",
      errorMessage: error.message,
      error
    })   
  }
}

/* -------------------------------------------------------------------------- */

module.exports = { stopUploads, startUploads, uploadStatus }