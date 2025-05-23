/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Upload = require("../models/schemas/Upload")
const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* -------------------------------------------------------------------------- */

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ originId: req.params.commentId }).populate("comments")

    res.status(200).json({
      success: true,
      message: "Fetched comments",
      data: {
        comments
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------------------------------------------------------------- */

exports.commentOnPool = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: { 
        userId: req.userId,
        username: req.username
      },
      originType: "Pool",
      originId: req.params.poolId,
      content: req.body.content
    })

    // Update the pool with the new comment
    await Pool.findOneAndUpdate({ 
      _id: req.params.poolId,
      $or: [
        { privacy: "Public" },
        { "user.userId": req.userId }
      ]
    }, {
      $push: {
        comments: postedComment._id
      }
    })

    res.status(200).json({
      success: true,
      message: "Commented on pool",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on pool",
      errorMessage: error.message,
      error
    })
  }
}

/* --------------------------- Comment on comment --------------------------- */

exports.commentOnComment = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: { 
        userId: req.userId,
        username: req.username
      },
      originType: "Comment",
      originId: req.params.commentId,
      content: req.body.content
    })

    // Update the comment with the new comment
    await Comment.findOneAndUpdate({ 
      _id: req.params.commentId,
      $or: {
        privacy: "Public",
        "user.userId": req.userId
      }
    }, {
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
    await logError(req, error)
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
      user: { 
        userId: req.userId,
        username: req.username
      },
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Comment on video ---------------------------- */

/* exports.commentOnVideo = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: { 
        userId: req.userId,
        username: req.username
      },
      originType: "Video",
      originId: req.params.videoId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Upload.findOneAndUpdate({ 
      _id: req.params.videoId,
      $or: [
        { privacy: "Public" },
        { "user.userId": req.userId }
      ]
    }, {
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on video",
      errorMessage: error.message,
      error
    })
  }
} */

/* ---------------------------- Comment on image ---------------------------- */

/* exports.commentOnImage = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: { 
        userId: req.userId,
        username: req.username
      },
      originType: "Image",
      originId: req.params.imageId,
      content: req.body.content
    })

    const postedComment = await Comment.create({
      user: req.userId,
      originType: "Image",
      originId: req.params.imageId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Upload.findOneAndUpdate({ 
      _id: req.params.imageId,
      $or: [
        { privacy: "Public" },
        { "user": req.userId }
      ]
    }, {
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on image",
      errorMessage: error.message,
      error
    })
  }
} */

/* ---------------------------- Comment on audio ---------------------------- */

/* exports.commentOnAudio = async (req, res) => {
  try {
    const postedComment = await Comment.create({
      user: { 
        userId: req.userId,
        username: req.username
      },
      originType: "Audio",
      originId: req.params.audioId,
      content: req.body.content
    })

    // Update the user with the new comment
    await Audio.findOneAndUpdate({ 
      _id: req.params.audioId,
      $or: [
        { privacy: "Public" },
        { "user.userId": req.userId }
      ]
    }, {
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on audio",
      errorMessage: error.message,
      error
    })
  }
} */

exports.commentOnUpload = async (req, res) => {
  try {
    // Update the user with the new comment
    const upload = await Upload.findOne({ 
      _id: req.params.uploadId,
      $or: [
        { privacy: "Public" },
        { "user": req.userId }
      ]
    })

    // The values for originId need to be titles of, Video, Audio, Image, Post, User
    const originType = String(upload.mediaType)[0].toUpperCase() + String(upload.mediaType).slice(1)

    const postedComment = await Comment.create({
      user: req.userId,
      originType: originType,
      originId: req.params.uploadId,
      content: req.body.content
    })

    // Actually save the changes to the user
    upload.comments.push(postedComment._id)
    await upload.save()


    res.status(200).json({
      success: true,
      message: "Commented on upload",
      data: {
        comment: postedComment
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to comment on upload",
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
      user: { 
        userId: req.userId,
        username: req.username
      },
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
    await logError(req, error)
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
      "user.userId": req.userId
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
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      errorMessage: error.message,
      error
    })
  }
}
