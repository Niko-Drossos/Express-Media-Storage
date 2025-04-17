/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Upload = require("../models/schemas/Upload")
const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Helpers -------------------------------- */
const castVote = require("../helpers/castVote")
/* -------------------------------------------------------------------------- */

exports.voteOnPool = async (req, res) => {
  try {
    // Update the pool with the new vote
    const { poolId } = req.params

    const newVote = {
      user: req.userId,
      vote: req.body.vote
    }
    
    const pool = await Pool.findById(poolId)
    
    const updated = await castVote(pool, newVote)

    res.status(200).json({
      success: true,
      message: "voted on pool",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on pool",
      errorMessage: error.message,
      error
    })
  }
}

/* --------------------------- Vote on comment --------------------------- */

exports.voteOnComment = async (req, res) => {
  try {
    // Update the comment with the new vote
    const { commentId } = req.params

    const newVote = {
      user: req.userId,
      vote: req.body.vote
    }
    
    const comment = await Comment.findById(commentId)
    
    const updated = await castVote(comment, newVote)

    res.status(200).json({
      success: true,
      message: "Voted on comment",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on comment",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Vote on user ---------------------------- */

exports.voteOnUser = async (req, res) => {
  try {
    // Update the user with the new comment
    const paramUserId = req.params.userId

    const newVote = {
      user: req.userId,
      vote: req.body.vote
    }
    
    const user = await User.findById(paramUserId)
    
    const updated = await castVote(user, newVote)

    res.status(200).json({
      success: true,
      message: "Voted on user",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on video ---------------------------- */

/* exports.voteOnVideo = async (req, res) => {
  try {
    // Update the video with the new vote
    const { videoId } = req.params

    const newVote = {
      user: req.userId,
      vote: req.body.vote
    }

    const video = await Video.findById(videoId)

    const updated = await castVote(video, newVote)

    res.status(200).json({
      success: true,
      message: "voted on video",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on video",
      errorMessage: error.message,
      error
    })
  }
} */

/* ---------------------------- Vote on image ---------------------------- */

exports.voteOnUpload = async (req, res) => {
  try {
    // Update the user with the new comment
    const { uploadId } = req.params

    const newVote = {
      user: req.userId,
      vote: req.body.vote
    }
    
    const upload = await Upload.findById(uploadId).populate("user")
    
    const updated = await castVote(upload, newVote)

    res.status(200).json({
      success: true,
      message: "Voted on upload",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on upload",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on audio ---------------------------- */

/* exports.voteOnAudio = async (req, res) => {
  try {
    // Update the user with the new comment
    const { audioId } = req.params

    const newVote = {
      user: userId,
      vote: req.body.vote
    }
    
    const audio = await Audio.findById(audioId)
    
    const updated = await castVote(audio, newVote)

    res.status(200).json({
      success: true,
      message: "Voted on audio",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to vote on audio",
      errorMessage: error.message,
      error
    })
  }
} */