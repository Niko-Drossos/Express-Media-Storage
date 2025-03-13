const path = require("path")
const API_URL = process.env.API_URL
/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Helpers -------------------------------- */
const { deleteFiles } = require("../helpers/gridFsMethods")
const getCookies = require("../models/middleware/getCookies")
/* ------------------------------- Get a pool ------------------------------- */

exports.getPool = async (req, res) => {
  try {
    const foundPool = await Pool.findById(req.params.poolId).populate(['comments', 'videos', 'images', 'audios'])

    res.status(200).json({
      success: true,
      message: "Successfully fetched pool",
      data: {
        pool: foundPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to get pool",
      errorMessage: error.message,
      error
    })
  }
}


/* ------------------------------ Create a pool ----------------------------- */

exports.createPool = async (req, res) => {
  try {
    const { title, description, privacy, images, videos, audios, tags, journal } = req.body

    const createdPool = await Pool.create({
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
        pools: createdPool._id
      }
    })

    res.status(201).json({
      success: true,
      message: "Successfully created pool",
      data: {
        pool: createdPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to create pool",
      errorMessage: error.message,
      error 
    })
  }
}

/* ------------------------------ Update a pool ----------------------------- */

exports.editPool = async (req, res) => {
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

    // Make sure that the person updating the pool is the one who created it
    const updatedPool = await Pool.findOneAndUpdate(
      { 
        _id: req.params.poolId,
        "user.userId": req.userId
      }, 
      updatedInformation,
      { 
        new: true
      }
    )

    res.status(200).json({
      success: true,
      message: "Successfully updated pool",
      data: {
        newPool: updatedPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to update pool",
      errorMessage: error.message,
      error 
    })
  }
}

/* ------------------------- Add a new journal entry ------------------------ */

exports.addJournal = async (req, res) => {
  try {
    const { entry, time, poolId } = req.body

    const updatedPool = await Pool.findOneAndUpdate({ 
      "user.userId": req.userId,
      _id: poolId,
    },{
      $push: {
        journal: {
          time: time,
          entry: entry
        }
      }
    },{ 
      new: true 
    })

    if (!updatedPool) throw new Error("Pool not found or not owned by the user")

    res.status(200).json({
      success: true,
      message: "Successfully updated pool",
      data: {
        newPool: updatedPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to update pool",
      errorMessage: error.message,
      error 
    })
  }
}

/* ------------------------------ Delete a pool ----------------------------- */

exports.deletePool = async (req, res) => {
  try {
    const deletedPool = await Pool.findOneAndUpdate({
      _id: req.params.poolId,
      // This is to prevent users from deleting other users' pools
      "user.userId": req.userId
    }, {
      title: "Deleted",
      description: `Pool deleted ${new Date().toLocaleDateString}`,
      deleted: {
        isDeleted: true,
        date: new Date().toISOString()
      }
    })

    if (!deletedPool) throw new Error("Pool not found or not own by the user")

    // Delete all the files associated with the pool
    // I changed my mind and wont delete the files for now
    // const deletedImages = await deleteFiles(req, res, { fileIds: deletedPool.images.map(image => image._id), mimetype: "image" })
    // const deletedVideos = await deleteFiles(req, res, { fileIds: deletedPool.videos.map(video => video._id), mimetype: "video" })
    // const deletedAudios = await deleteFiles(req, res, { fileIds: deletedPool.audios.map(audio => audio._id), mimetype: "audio" })

    res.status(200).json({
      success: true,
      message: "Successfully deleted pool",
      data: {
        deletedPool,
        // deletedImages,
        // deletedVideos,
        // deletedAudios
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to delete pool",
      errorMessage: error.message,
      error 
    })
  }
}