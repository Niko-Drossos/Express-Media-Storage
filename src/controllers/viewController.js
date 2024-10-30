/* --------------------------------- Helpers -------------------------------- */
const { streamFile } = require("../helpers/gridFsMethods")
/* -------------------------------------------------------------------------- */

// These are all separate controllers for each type of media because i might add to them

/* ----------------------------- Stream a video ----------------------------- */

exports.viewVideo = async (req, res) => {
  try {
    streamFile(req, res, req.params.fileId)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view video",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Stream an image ---------------------------- */

exports.viewImage = async (req, res) => {
  try {
    streamFile(req, res, req.params.fileId)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view image",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Stream an audio ---------------------------- */

exports.viewAudio = async (req, res) => {
  try {
    streamFile(req, res, req.params.fileId)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view audio",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------------------------------------------------------------- */