const path = require("path")
const fs = require("fs")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* -------------------------------------------------------------------------- */

/* ------------------------------ Populate post ----------------------------- */

exports.viewPost = async (req, res) => {
  try {
    const foundPost = await Post.findById(req.params.postId).populate(['comments', 'videos', 'images', 'audios'])

    res.status(200).json({
      success: true,
      message: "Successfully viewed post",
      data: {
        post: foundPost
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view post",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Populate comment ---------------------------- */

exports.viewComment = async (req, res) => {
  try {
    const foundComment = await Comment.findById(req.params.commentId).populate('comments') // maybe add "originId"

    res.status(200).json({
      success: true,
      message: "Successfully viewed comment",
      data: {
        comment: foundComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view comment",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Populate video ----------------------------- */

exports.viewVideo = async (req, res) => {
  try {
    const foundVideo = await Video.findById(req.params.videoId).populate('comments') // maybe add "originId"

    res.status(200).json({
      success: true,
      message: "Successfully viewed video",
      data: {
        video: foundVideo
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view video",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Populate image ----------------------------- */

exports.viewImage = async (req, res) => {
  try {
    const foundImage = await Image.findById(req.params.imageId).populate('comments')

    res.status(200).json({
      success: true,
      message: "Successfully viewed image",
      data: {
        image: foundImage
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view image",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Populate audio ----------------------------- */

exports.viewAudio = async (req, res) => {
  try {
    const foundAudio = await Audio.findById(req.params.audioId).populate('comments')

    res.status(200).json({
      success: true,
      message: "Successfully viewed audio",
      data: {
        audio: foundAudio
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view audio",
      errorMessage: error.message,
      error
    })
  }
}