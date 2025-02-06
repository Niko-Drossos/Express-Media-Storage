// This file will contain all the routes related to transcription.
// This includes creating a transcription, getting a transcription, updating a transcription, and deleting a transcription.
// These routes will also be used for returning a .vtt file of the transcription for use in subtitles.

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Image = require("../models/schemas/Image")
const Video = require("../models/schemas/Video")
const Audio = require("../models/schemas/Audio")
const Transcription = require("../models/schemas/Transcription")
/* -------------------------------------------------------------------------- */

generate = async (req, res) => {
  try {
    const { documentId, mimetype } = req.params

    const transcription = await Transcription.create(req.body)
    
    // Add the transcription _id to the document
    switch (mimetype) {
      // Not needed for transcriptions
      /* case "image":
        const image = await Image.findById(documentId)
        image.transcription = transcription._id
        await image.save()
        break */
      case "video":
        const video = await Video.findById(documentId)
        video.transcription = transcription._id
        await video.save()
        break
      case "audio":
        const audio = await Audio.findById(documentId)
        audio.transcription = transcription._id
        await audio.save()
        break
    }
    
    res.status(200).json({
      success: true,
      message: "Generated transcription",
      data: {
        transcription
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/* ------------------- Request a transcription by its _id ------------------- */

getById = async (req, res) => {
  try {
    const { transcriptionId } = req.params

    const transcription = await Transcription.findById(transcriptionId)

    res.status(200).json({
      success: true,
      message: "Retrieved transcription",
      data: {
        transcription
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/* -------------- Request a transcription for subtitle purposes ------------- */

getSubtitles = async (req, res) => {
  try {
    const { transcriptionId } = req.params

    const transcription = await Transcription.findById(transcriptionId)

    // Set appropriate headers for the browser
    res.setHeader("Content-Type", "text/vtt")

    res.status(200).send(transcription.text)
  } catch (error) {
    res.status(500).send(error.message)
  }
}


module.exports = { generate, getById, getSubtitles }