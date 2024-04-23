const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */

/* -------------------------------------------------------------------------- */

exports.createPost = async (req, res) => {
  try {
    const { title, description, privacy, images, videos, audios, tags } = req.body

    const createdPost = await Post.create({
      user: req.userId,
      title, 
      description,
      privacy,
      images: images || [], 
      videos: videos || [], 
      audios: audios || [],
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      message: "Successfully created post",
      data: createdPost
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to create post",
      errorMessage: error.message,
      error 
    })
  }
}