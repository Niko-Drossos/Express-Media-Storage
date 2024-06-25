/* --------------------------------- Schemas -------------------------------- */
const Video = require("../models/schemas/Video")
const Audio = require("../models/schemas/Audio")
/* -------------------------------------------------------------------------- */

/* -------------------- Request a transcription for Video ------------------- */

exports.requestVideoTranscription = async (req, res) => {
  try {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) throw new Error("Video not found")

    const authentication = req.cookies.media_authentication || req.headers["x-access-token"]

    const fetchVideo = await fetch(`http://localhost:3000/view/video/${video.filename}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": authentication 
      }
    })

    const formData = new FormData()
    formData.append("audio", fetchVideo.body)   

    const response = await fetch(`http://localhost:5000/transcribe`, {
      method: "POST",
      headers: {
        "x-access-token": authentication 
      },
      body: formData
    })

    console.log(response)

    res.status(200).json({
      success: true,
      message: "Successfully requested transcription for video",
      data: {
        fetchVideo,
        formData: formData.entries,
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to request transcription for video",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------- Request a transcription for Audio ------------------- */

exports.viewImage = async (req, res) => {
  try {
    streamFile(req, res, req.params.filename)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view image",
      errorMessage: error.message,
      error
    })
  }
}