/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
const addVotedAndFavorited = require("../models/middleware/mongoose/addVotedAndFavorited")
/* --------------------------------- Helpers -------------------------------- */
const searchDateRange = require("../helpers/searchDateRange")
/* -------------------------------------------------------------------------- */

/* --------------------------- Search for users by name ----------------------- */

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { username, tags, id, comments=false, page=1, limit=12 } = query

    // Add the search query's properties to the searchQuery object
    if (username) searchQuery.username = new RegExp(username, 'i')
    if (tags) searchQuery.tags = tags.split(",")
    if (id) searchQuery._id = id

    const totalDocuments = await User.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const searchResults = await User.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(comments ? 'comments' : '')

    res.status(200).json({
      success: true,
      message: "Successfully searched for users",
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page, 
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for users",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------ Search for pools within a time frame ------------------ */

exports.searchPools = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}

    const { userId, usernames, tags, startDate, endDate, title, description, transcription, ids, comments=false, populate=false, page=1, limit=12 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }
    
    // Add the search query's properties to the searchQuery object
    if (userId) searchQuery["user.userId"] = userId
    if (tags) searchQuery.tags = { $all: tags.split(",") }
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')
    if (description) searchQuery.description = new RegExp(description, 'i')
    if (transcription) searchQuery.transcription = new RegExp(transcription, 'i')
    if (ids) searchQuery._id = { $in: ids.split(',') }

    // Only allow for searching of a users own documents or those made public
    searchQuery.$or = [
      { "user.userId": req.userId },
      { privacy: "Public" }
    ]

    // Get the total number of documents that match the search query
    const totalDocuments = await Pool.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const populatedFields = []

    if (populate) {
      populatedFields.push('images')
      populatedFields.push('videos')
      populatedFields.push('audios')
    }

    if (comments) {
      populatedFields.push('comments')
    }

    const searchResults = await Pool.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(populatedFields)
      .lean()

    // Get the users favorite pools
    const user = await User.findById(req.userId).select("favorites.pools")
    const favoritedPools = user?.favorites?.pools

    // Middleware to add and remove document properties
    searchResults.forEach(doc => addVotedAndFavorited(doc, favoritedPools, req.userId))
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully searched for pools" ,
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to search for pools",
      errorMessage: error.message,
      error 
    })
  }
}

/* ----------------------------- Search comments ---------------------------- */

exports.searchComments = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { userId, usernames, originId, startDate, endDate, content, ids, comments=false, page=1, limit=12 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }

    // Add the search query's properties to the searchQuery object
    if (userId) searchQuery["user.userId"] = userId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (content) searchQuery.content = new RegExp(content, 'i')
    if (originId) searchQuery.originId = originId
    if (ids) searchQuery._id = { $in: ids.split(',') }

    // Get the total number of documents that match the search query
    const totalDocuments = await Comment.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const searchResults = await Comment.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(comments ? 'comments' : '')
      .lean()

    // Get the users favorite comments
    const user = await User.findById(req.userId).select("favorites.comments")
    const favoritedComments = user?.favorites?.comments

    // Middleware to add and remove document properties
    searchResults.forEach(doc => addVotedAndFavorited(doc, favoritedComments, req.userId))
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for comments" ,
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({ 
      success: false,
      message: "Failed to search for comments",
      errorMessage: error.message,
      error 
    })
  }
}

/* ------------------------------ Search videos ----------------------------- */

exports.searchVideos = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { userId, usernames, title, startDate, endDate, content, tags, ids, comments=false,page=1, limit=12 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }

    // Add the search query's properties to the searchQuery object
    if (userId) searchQuery["user.userId"] = userId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')
    if (content) searchQuery.transcription.text = new RegExp(content, 'i')
    if (tags) searchQuery.tags = { $all: tags.split(",") }
    if (ids) searchQuery._id = { $in: ids.split(',') }

    // Only allow for searching of a users own documents or those made public
    searchQuery.$or = [
      { "user.userId": req.userId },
      { privacy: "Public" }
    ]

    // Only allow for searching of completed videos
    searchQuery.status = "completed"

    // Get the total number of documents that match the search query
    const totalDocuments = await Video.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const searchResults = await Video.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(comments ? 'comments' : '')
      .lean()

    // Get the users favorite videos
    const user = await User.findById(req.userId).select("favorites.videos")
    const favoritedVideos = user?.favorites?.videos || []

    // Middleware to add and remove document properties
    searchResults.forEach(doc => addVotedAndFavorited(doc, favoritedVideos, req.userId))

    res.status(200).json({
      success: true, 
      message: "Successfully searched for videos" ,
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for videos",
      errorMessage: error.message,
      error
    })
  }
}


/* ------------------------------ Search images ----------------------------- */

exports.searchImages = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { userId, usernames, title, startDate, endDate, tags, ids, comments=false, page=1, limit=12 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }
    
    // Add the search query's properties to the searchQuery object
    if (userId) searchQuery["user.userId"] = userId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')
    if (tags) searchQuery.tags = { $all: tags.split(",") }
    if (ids) searchQuery._id = { $in: ids.split(',') }

    // Only allow for searching of a users own documents or those made public
    searchQuery.$or = [
      { "user.userId": req.userId },
      { privacy: "Public" }
    ]

    // Only allow for searching of completed images
    searchQuery.status = "completed"

    // Get the total number of documents that match the search query
    const totalDocuments = await Image.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const searchResults = await Image.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(comments ? 'comments' : '')
      .lean()

    // Get the users favorite images
    const user = await User.findById(req.userId).select("favorites.images")
    const favoritedImages = user?.favorites?.images || []

    // Middleware to add and remove document properties
    searchResults.forEach(doc => addVotedAndFavorited(doc, favoritedImages, req.userId))
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for images" ,
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for images",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------------ Search audios ----------------------------- */

exports.searchAudios = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { userId, usernames, title, startDate, endDate, tags, ids, comments=false, page=1, limit=12 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }

    // Add the search query's properties to the searchQuery object
    // TODO: Maybe make userId a list? 
    if (userId) searchQuery["user.userId"] = userId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')
    if (tags) searchQuery.tags = { $all: tags.split(",") }
    if (ids) searchQuery._id = { $in: ids.split(',') }

    // Only allow for searching of a users own documents or those made public
    searchQuery.$or = [
      { "user.userId": req.userId },
      { privacy: "Public" }
    ]

    // Only allow for searching of completed audios
    searchQuery.status = "completed"

    // Get the total number of documents that match the search query
    const totalDocuments = await Audio.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const searchResults = await Audio.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(comments ? 'comments' : '')
      .lean()

    // Get the users favorite audios
    const user = await User.findById(req.userId).select("favorites.audios")
    const favoritedAudios = user?.favorites?.audios || []

      // Middleware to add and remove document properties
    searchResults.forEach(doc => addVotedAndFavorited(doc, favoritedAudios, req.userId))
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for audios" ,
      data: {
        documents: {
          start: (page - 1) * limit + 1,
          end: Math.min((page * limit), totalDocuments),
          count: totalDocuments,
        },
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for audios",
      errorMessage: error.message,
      error
    })
  }
}