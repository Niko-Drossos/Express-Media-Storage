const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Pool")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */
const { deleteFiles } = require("../helpers/gridFsMethods")
/* ------------------------------- Get a post ------------------------------- */

exports.getPost = async (req, res) => {
  try {
    const foundPost = await Post.findById(req.params.poolId).populate(['comments', 'videos', 'images', 'audios'])

    res.status(200).json({
      success: true,
      message: "Successfully fetched post",
      data: {
        post: foundPost
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get post",
      errorMessage: error.message,
      error
    })
  }
}


/* ------------------------------ Create a post ----------------------------- */

exports.createPost = async (req, res) => {
  try {
    const { title, description, privacy, images, videos, audios, tags, journal } = req.body

    const createdPost = await Post.create({
      user: {
        userId: req.userId,
        username: req.username
      },
      title: title || undefined, // This is so that mongoose defaults to the date it was created
      description,
      privacy,
      images: images ? images.split(",") : [], 
      videos: videos ? videos.split(",") : [], 
      audios: audios ? audios.split(",") : [],
      tags: tags ? tags.split(",") : [],
      journal: journal || [],
    })

    await User.findByIdAndUpdate(req.userId, {
      $push: {
        posts: createdPost._id
      }
    })

    res.status(201).json({
      success: true,
      message: "Successfully created post",
      data: {
        post: createdPost
      }
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
      { _id: req.params.poolId, "user.userId": req.userId }, 
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

/* ------------------------- Add a new journal entry ------------------------ */

exports.addJournal = async (req, res) => {
  try {
    const date = new Date()
    // Format the date to 24 hours and only time
    const formattedTime = date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false })

    const updatedPost = await Post.findOneAndUpdate({ 
      "user.userId": req.userId,
      _id: req.params.poolId,
    },{
      $push: {
        journal: {
          time: formattedTime,
          entry: req.body.entry
        }
      }
    },{ 
      new: true 
    })

    if (!updatedPost) throw new Error("Post not found or not own by the user")

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
    const deletedPost = await Post.findOneAndUpdate({
      _id: req.params.poolId,
      // This is to prevent users from deleting other users' posts
      "user.userId": req.userId
    }, {
      title: "Deleted",
      description: `Post deleted ${new Date().toLocaleDateString}`,
      deleted: {
        isDeleted: true,
        date: new Date().toISOString()
      }
    })

    if (!deletedPost) throw new Error("Post not found or not own by the user")

    // Delete all the files associated with the post
    // I changed my mind and wont delete the files for now
    // const deletedImages = await deleteFiles(req, res, { fileIds: deletedPost.images.map(image => image._id), mimetype: "image" })
    // const deletedVideos = await deleteFiles(req, res, { fileIds: deletedPost.videos.map(video => video._id), mimetype: "video" })
    // const deletedAudios = await deleteFiles(req, res, { fileIds: deletedPost.audios.map(audio => audio._id), mimetype: "audio" })

    res.status(200).json({
      success: true,
      message: "Successfully deleted post",
      data: {
        deletedPost,
        // deletedImages,
        // deletedVideos,
        // deletedAudios
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