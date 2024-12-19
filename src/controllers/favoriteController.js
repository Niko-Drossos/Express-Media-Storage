/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* -------------------------------------------------------------------------- */

/* ---------------------------- Favorite a video ---------------------------- */

exports.favoriteVideo = async (req, res) => {
  try {
    const { videoId } = req.params

    const user = await User.findById(req.userId).select("favorites.videos")
    const video = await Video.findById(videoId)

    // Return a 404 if the videoId is not in the database
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      })
    }

    if (user.favorites.videos.includes(videoId)) {
      // Remove the video from the user's favorites
      user.favorites.videos.pull(videoId)
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Successfully unfavorited video",
        data: {
          favorites: {
            videos: user.favorites.videos,
          },
          Count: user.favorites.videos.length
        }
      })
    }

    // Add the video to the user's favorites
    user.favorites.videos.push(videoId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Successfully favorited video",
      data: {
        favorites: {
          videos: user.favorites.videos,
        },
        Count: user.favorites.videos.length
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

/* ---------------------------- Favorite an image ---------------------------- */

exports.favoriteImage = async (req, res) => {
  try {
    const { imageId } = req.params

    const user = await User.findById(req.userId).select("favorites.images")
    const image = await Image.findById(imageId)

    // Return a 404 if the imageId is not in the database
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      })
    }

    if (user.favorites.images.includes(imageId)) {
      // Remove the image from the user's favorites
      user.favorites.images.pull(imageId)
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Successfully unfavorited image",
        data: {
          favorites: {
            images: user.favorites.images,
          },
          Count: user.favorites.images.length
        }
      })
    }

    // Add the image to the user's favorites
    user.favorites.images.push(imageId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Successfully favorited image",
      data: {
        favorites: {
          images: user.favorites.images,
        },
        Count: user.favorites.images.length
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

/* ---------------------------- Favorite an audio ---------------------------- */

exports.favoriteAudio = async (req, res) => {
  try {
    const { audioId } = req.params

    const user = await User.findById(req.userId).select("favorites.audios")
    const audio = await Audio.findById(audioId)

    // Return a 404 if the audioId is not in the database
    if (!audio) {
      return res.status(404).json({
        success: false,
        message: "Audio not found"
      })
    }

    if (user.favorites.audios.includes(audioId)) {
      // Remove the audio from the user's favorites
      user.favorites.audios.pull(audioId)
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Successfully unfavorited audio",
        data: {
          favorites: {
            audios: user.favorites.audios,
          },
          Count: user.favorites.audios.length
        }
      })
    }

    // Add the audio to the user's favorites
    user.favorites.audios.push(audioId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Successfully favorited audio",
      data: {
        favorites: {
          audios: user.favorites.audios,
        },
        Count: user.favorites.audios.length
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

/* ---------------------------- Favorite a comment ---------------------------- */

exports.favoriteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    const user = await User.findById(req.userId).select("favorites.comments")
    const comment = await Comment.findById(commentId)

    // Return a 404 if the commentId is not in the database
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      })
    }

    if (user.favorites.comments.includes(commentId)) {
      // Remove the comment from the user's favorites
      user.favorites.comments.pull(commentId)
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Successfully unfavorited comment",
        data: {
          favorites: {
            comments: user.favorites.comments,
          },
          Count: user.favorites.comments.length
        }
      })
    }

    // Add the comment to the user's favorites
    user.favorites.comments.push(commentId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Successfully favorited comment",
      data: {
        favorites: {
          comments: user.favorites.comments,
        },
        Count: user.favorites.comments.length
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

/* ---------------------------- Favorite a pool ---------------------------- */

exports.favoritePool = async (req, res) => {
  try {
    const { poolId } = req.params

    const user = await User.findById(req.userId).select("favorites.pools")
    const pool = await Pool.findById(poolId)

    // Return a 404 if the poolId is not in the database
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "pool not found"
      })
    }

    if (user.favorites.pools.includes(poolId)) {
      // Remove the pool from the user's favorites
      user.favorites.pools.pull(poolId)
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Successfully unfavorited pool",
        data: {
          favorites: {
            pools: user.favorites.pools,
          },
          Count: user.favorites.pools.length
        }
      })
    }

    // Add the pool to the user's favorites
    user.favorites.pools.push(poolId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Successfully favorited pool",
      data: {
        favorites: {
          pools: user.favorites.pools,
        },
        Count: user.favorites.pools.length
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to view pool",
      errorMessage: error.message,
      error
    })
  }
}

/* -------------------------------------------------------------------------- */