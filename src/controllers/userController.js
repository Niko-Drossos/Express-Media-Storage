/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Image = require("../models/schemas/Image")
const Video = require("../models/schemas/Video")
const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */

/* --------------------------------- Helpers -------------------------------- */

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId)

    res.status(200).json({
      success: true,
      message: "Fetched user",
      data: {
        user
      }
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "User not found, user id is invalid",
        errorMessage: error.message,
        error
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      errorMessage: error.message,
      error
    })
  }
}

exports.getMyFiles = async (req, res) => {
  try {
    const fetchImages = await Image.find({ uploader: req.userId }) || []
    const fetchVideos = await Video.find({ uploader: req.userId }) || []
    const fetchAudios = await Audio.find({ uploader: req.userId }) || []

    return res.status(200).json({
      success: true,
      message: "Fetched users files",
      data: {
        images: fetchImages,
        videos: fetchVideos,
        audios: fetchAudios 
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user files",
      errorMessage: error.message,
      error
    })
  }    
}