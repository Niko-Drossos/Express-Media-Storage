const { createFromHexString } = require("mongoose").Types.ObjectId
/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Upload = require("../models/schemas/Upload")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Helpers -------------------------------- */
const { smallUpload, deleteFiles } = require("../helpers/gridFsMethods")
/* -------------------------------------------------------------------------- */

/* ---------------------- Get one user for profile page --------------------- */

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId)

    res.status(200).json({
      success: true,
      message: "Fetched user",
      data: {
        user
      }
    })
  } catch (error) {
    await logError(req, error)
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "User not found, user id is invalid",
        errorMessage: error.message,
        error
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Fetch user files ---------------------------- */

exports.getMyFiles = async (req, res) => {
  try {
    // const fetchImages = await Image.find({ "user.userId": req.userId }) || []

    // Return only the fields used for the UI for creating pools.
    // title, _id, privacy, date, tags, voteCount, and description
    const includedFields = { title: 1, _id: 1, privacy: 1, date: 1, tags: 1, voteCount: 1, description: 1, mediaType: 1 }

    const userId = createFromHexString(req.userId)

    const fetchUploads = await Upload.aggregate([
      { $match: { "user": userId }},
      { $project: includedFields }
    ])

    // Filter out the files by media type
    const images = []
    const videos = []
    const audios = []

    fetchUploads.forEach(media => {
      if (media.mediaType == "image") {
        images.push(media)
      } else if (media.mediaType == "video") {
        videos.push(media)
      } else if (media.mediaType == "audio") {
        audios.push(media)
      }
    })

    res.status(200).json({
      success: true,
      message: "Fetched users files",
      data: {
        images,
        videos,
        audios
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to get user files",
      errorMessage: error.message,
      error
    })
  }    
}

/* -------------------------- Get user media titles ------------------------- */

// This is used for getting data to add media to Pools
exports.mediaTitles = async (req, res) => {
  try {
    const images = await Upload.find({ "user.userId": req.userId })
    const videos = await Video.find({ "user.userId": req.userId })
    const audios = await Audio.find({ "user.userId": req.userId })

    function separateTitles(media) {
      media.sort((a, b) => new Date(b.date) - new Date(a.date))
      return media.map(media => ({
        title: media.title,
        date: media.date,
        _id: media._id,
      }))
    }

    res.status(200).json({
      success: true,
      message: "Fetched users media titles",
      data: {
        images: separateTitles(images),
        videos: separateTitles(videos),
        audios: separateTitles(audios)
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to get users media titles",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------------ Follow a user ----------------------------- */

exports.follow = async (req, res) => {
  try {
    const followedUser = await User.findByIdAndUpdate(req.params.userId, {
      $push: {
        followers: req.userId
      }
    }, {
      new: true
    })  

    const followingUser = await User.findByIdAndUpdate(req.userId, {
      $push: {
        following: req.params.userId
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: `${followingUser.username} followed ${followedUser.username}`,
      data: {
        user: {
          username: followingUser.username,
          id: followingUser._id
        },
        followed: {
          username: followedUser.username,
          id: followedUser._id
        }
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to follow user",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------------ Unfollow user ----------------------------- */

exports.unfollow = async (req, res) => {
  try {
    const unfollowedUser = await User.findByIdAndUpdate(req.params.userId, {
      $pull: {
        followers: req.userId
      }
    }, {
      new: true
    })

    const unfollowingUser = await User.findByIdAndUpdate(req.userId, {
      $pull: {
        following: req.params.userId
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: `${unfollowingUser.username} unfollowed ${unfollowedUser.username}`,
      data: {
        user: {
          username: unfollowingUser.username,
          id: unfollowingUser._id
        },
        unfollowed: {
          username: unfollowedUser.username,
          id: unfollowedUser._id
        }
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
      errorMessage: error.message,
      error
    })
  }
}


exports.uploadAvatar = async (req, res) => {
  try {
    const fileId = await smallUpload(req, res)

    const user = await User.findById(req.userId)

    await User.findByIdAndUpdate(user._id, {
      avatarId: fileId
    })

    // TODO: Fix this not actually deleting the old image, works fine for now.
    /* await deleteFiles(req, res, {
      fileIds: [user.avatarId],
      mimetype: "image"
    }) */

    res.status(200).json({
      success: true,
      message: "Avatar uploaded",
      data: {
        user
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      errorMessage: error.message,
      error
    })
  }
}