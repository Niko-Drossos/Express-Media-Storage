/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */
const castVote = require("../helpers/castVote")
/* -------------------------------------------------------------------------- */

exports.voteOnPost = async (req, res) => {
  try {
    // Update the post with the new vote
    const { poolId } = req.params
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
      vote: req.body.vote
    }
    
    const post = await Post.findById(poolId)
    
    const updated = await castVote(post, newVote)

    res.status(200).json({
      success: true,
      message: "voted on post",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on post",
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
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
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
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
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
    res.status(500).json({
      success: false,
      message: "Failed to vote on user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on video ---------------------------- */

exports.voteOnVideo = async (req, res) => {
  try {
    // Update the video with the new vote
    const { videoId } = req.params
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
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
    res.status(500).json({
      success: false,
      message: "Failed to vote on video",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on image ---------------------------- */

exports.voteOnImage = async (req, res) => {
  try {
    // Update the user with the new comment
    const { imageId } = req.params
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
      vote: req.body.vote
    }
    
    const image = await Image.findById(imageId)
    
    const updated = await castVote(image, newVote)

    res.status(200).json({
      success: true,
      message: "Voted on image",
      data: {
        vote: req.body.vote,
        voteCount: updated.voteCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on image",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on audio ---------------------------- */

exports.voteOnAudio = async (req, res) => {
  try {
    // Update the user with the new comment
    const { audioId } = req.params
    const { userId, username } = req

    const newVote = {
      user: {
        userId,
        username
      },
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
    res.status(500).json({
      success: false,
      message: "Failed to vote on audio",
      errorMessage: error.message,
      error
    })
  }
}