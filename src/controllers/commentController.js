const path = require("path")  
const fs = require("fs")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
/* -------------------------------------------------------------------------- */

exports.commentOnPost = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Post",
      originId: req.params.postId,
      content: req.body.content
    })

    // Update the post with the new comment
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on post",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on post",
      errorMessage: error.message,
      error
    })
  }
}

/* --------------------------- Comment on comment --------------------------- */

exports.commentOnComment = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Comment",
      originId: req.params.commentId,
      content: req.body.content
    })

    // Update the comment with the new comment
    await Comment.findByIdAndUpdate(req.params.commentId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on comment",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on comment",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Comment on user ---------------------------- */

exports.commentOnUser = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "User",
      originId: req.params.userId,
      content: req.body.content
    })

    // Update the user with the new comment
    await User.findByIdAndUpdate(req.params.userId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on user",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Comment on video ---------------------------- */

exports.commentOnVideo = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Video",
      originId: req.params.videoId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Video.findByIdAndUpdate(req.params.videoId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on video",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on video",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Comment on image ---------------------------- */

exports.commentOnImage = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Image",
      originId: req.params.imageId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Image.findByIdAndUpdate(req.params.imageId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on image",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on image",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Comment on audio ---------------------------- */

exports.commentOnAudio = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Audio",
      originId: req.params.audioId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Audio.findByIdAndUpdate(req.params.audioId, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on audio",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on audio",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                                Delete routes                               */
/* -------------------------------------------------------------------------- */

exports.deleteComment = async (req, res) => {
  try {
    const deletedComment = await Comment.findOneAndUpdate({
      _id: req.params.commentId,
      user: req.userId,
      deleted: { $ne: true } // Make sure the comment is not already deleted
    }, {
      content: `[This comment was deleted on ${new Date(Date.now()).toLocaleDateString()}, ${new Date(Date.now()).toLocaleTimeString()}]`,
      deleted: {
        isDeleted: true,
        date: Date.now()
      }
    })  

    if (!deletedComment) throw new Error("Comment not found or already deleted")

    res.status(200).json({
      success: true,
      message: "Deleted comment",
      data: {
        comment: deletedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                             Edit comment routes                            */
/* -------------------------------------------------------------------------- */

exports.updateComment = async (req, res) => {
  try {
    const updatedComment = await Comment.findOneAndUpdate({
      _id: req.params.commentId,
      user: req.userId
    }, {
      content: req.body.content,
      edited: {
        isEdited: true,
        date: Date.now()
      }
    }, {
      new: true
    })

    if (!updatedComment) throw new Error("Comment not found")

    res.status(200).json({
      success: true,
      message: "Updated comment",
      data: {
        comment: updatedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      errorMessage: error.message,
      error
    })
  }
}
