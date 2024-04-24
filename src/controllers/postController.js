const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */

/* -------------------------------------------------------------------------- */

/* ------------------------------ Create a post ----------------------------- */

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

    await User.findByIdAndUpdate(req.userId, {
      $push: {
        posts: createdPost._id
      }
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

/* ------------------------------ Update a post ----------------------------- */

exports.editPost = async (req, res) => {
  try {
    const { title, description, privacy, images, videos, audios, tags } = req.body

    const updatedInformation = {
      title,
      description,  
      images, 
      videos, 
      audios, 
      tags
    }

    if (privacy) updatedInformation.privacy = privacy

    // Make sure that the person updating the post is the one who created it
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.postId, user: req.userId }, 
      updatedInformation,
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "Successfully updated post",
      data: {
        newPost: updatedPost
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to update post",
      errorMessage: error.message,
      error 
    })
  }
}

/* ------------------------------ Delete a post ----------------------------- */

exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.postId,
      // This is to prevent users from deleting other users' posts
      user: req.userId
    })

    if (!deletedPost) throw new Error("Post not found")

    res.status(200).json({
      success: true,
      message: "Successfully deleted post",
      data: {
        deletedPost
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to delete post",
      errorMessage: error.message,
      error 
    })
  }
}