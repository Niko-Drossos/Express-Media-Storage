/* --------------------------------- Helpers -------------------------------- */
const { streamFile } = require("../helpers/fileUploading")
/* -------------------------------------------------------------------------- */

/* ------------------------------ Populate post ----------------------------- */
// Move
/* exports.viewPost = async (req, res) => {
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
} */

/* ---------------------------- Populate comment ---------------------------- */
// Move the correct logic to the controller folder
/* exports.viewComment = async (req, res) => {
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
} */

/* ----------------------------- Populate video ----------------------------- */

exports.viewVideo = async (req, res) => {
  try {
    streamFile(req, res, req.params.filename)
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

/* ----------------------------- Populate audio ----------------------------- */

exports.viewAudio = async (req, res) => {
  try {
    streamFile(req, res, req.params.filename)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view audio",
      errorMessage: error.message,
      error
    })
  }
}