/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Helpers -------------------------------- */
const getCookies = require("../models/middleware/getCookies")
/* ------------------------------- Get a pool ------------------------------- */

exports.getPool = async (req, res) => {
  try {
    const { poolId } = req.params

    const foundPool = await Pool.findById(poolId)
      .populate([
        'comments',
        'videos',
        'images',
        'audios'
      ])

    // Throw error on invalid poolId
    if (!foundPool) {
      res.status(404)
      throw new Error('Pool not found. Invalid poolId in URL.')
    }

    // Throw error on invalid access
    if (foundPool.user.userId != req.userId && foundPool.privacy != 'Public') {
      res.status(403)
      throw new Error('This is a private pool that you don\'t have access to.')
    }

    // Filter out any media documents that are not public and not posted by the user.
    // This is for when you are viewing a single pool, as that's the only real use case when pools are populated.
    function onlyPublic(doc) {
      if (doc.privacy != 'Public' && doc.user.userId != req.userId) return false
      return true
    }
    
    foundPool.images = foundPool.images.filter(onlyPublic)
    foundPool.videos = foundPool.videos.filter(onlyPublic)
    foundPool.audios = foundPool.audios.filter(onlyPublic)

    res.status(200).json({
      success: true,
      message: "Successfully fetched pool",
      data: {
        pool: foundPool
      }
    })
  } catch (error) {
    console.log(error)
    await logError(req, error)
    res.json({
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

    // TODO: Reconsider if storing the pools on the user document is necessary
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
    const { poolId } = req.params
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

    const foundPool = await Pool.findById(poolId)

    // Throw error on invalid poolId
    if (!foundPool) {
      res.status(404)
      throw new Error('Pool not found. Invalid poolId in URL.')
    }

    // Throw error on invalid access
    if (foundPool.user.userId != req.userId) {
      res.status(403)
      throw new Error('This pool is not used by this user and doe\'s not have edit access.')
    }

    const updatedPool = await Pool.findOneAndUpdate({
      "user.userId": req.userId,
        _id: poolId
      }, 
      updatedInformation,
      { 
        new: true
      })

    res.status(200).json({
      success: true,
      message: "Successfully updated pool",
      data: {
        newPool: updatedPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.json({ 
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

    const foundPool = await Pool.findById(poolId)

    // Throw error on invalid poolId
    if (!foundPool) {
      res.status(404)
      throw new Error('Pool not found. Invalid poolId in URL.')
    }

    // Throw error on invalid access
    if (foundPool.user.userId != req.userId && foundPool.privacy != 'Public') {
      res.status(403)
      throw new Error('This is a private pool that you don\'t have access to.')
    }

    const updatedPool = await Pool.updateOne({ 
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

    res.status(200).json({
      success: true,
      message: "Successfully updated pool",
      data: {
        updatedPool: updatedPool
      }
    })
  } catch (error) {
    await logError(req, error)
    res.json({ 
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
        deletedPool
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