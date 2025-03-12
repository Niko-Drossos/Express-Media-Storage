/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Pool = require("../models/schemas/Pool")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */
const searchDateRange = require("../helpers/searchDateRange")
/* -------------------------------------------------------------------------- */

/* --------------------------- Search for users by name ----------------------- */

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { username, tags, id, comments=false, page=1, limit=16 } = query

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
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page, 
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
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

    const { userId, usernames, tags, startDate, endDate, title, description, transcription, id, comments=false, populate=false, page=1, limit=16 } = query

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
    if (id) searchQuery._id = id

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

      // Add a property to see is the video is in the users favorites array
      if (favoritedPools) {
        searchResults.forEach((doc) => {
          doc.favorited = favoritedPools.includes(doc._id.toString());
        });
      } else {
        searchResults.forEach((doc) => {
          doc.favorited = false;
        });
      }
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully searched for pools" ,
      data: {
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
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
    
    const { userId, usernames, originId, startDate, endDate, content, id, comments=false, page=1, limit=12 } = query

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
    if (id) searchQuery._id = id

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

      // Add a property to see is the video is in the users favorites array
      if (favoritedComments) {
        searchResults.forEach((doc) => {
          doc.favorited = favoritedComments.includes(doc._id.toString());
        });
      } else {
        searchResults.forEach((doc) => {
          doc.favorited = false;
        });
      }
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for comments" ,
      data: {
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
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
    
    const { userId, usernames, title, startDate, endDate, content, tags, id, comments=false,page=1, limit=16 } = query

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
    if (id) searchQuery._id = id
    if (tags) searchQuery.tags = { $all: tags.split(",") }

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

    // Add a property to see is the video is in the users favorites array
    if (favoritedVideos) {
      searchResults.forEach((doc) => {
        doc.favorited = favoritedVideos.includes(doc._id.toString());
      });
    } else {
      searchResults.forEach((doc) => {
        doc.favorited = false;
      });
    }

    // Add a property to see if the user voted and return the result
    /* searchResults.forEach((doc) => {
      doc.voted = user.votes.videos.includes(doc._id.toString());
    }); */

    res.status(200).json({
      success: true, 
      message: "Successfully searched for videos" ,
      data: {
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
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
    
    const { userId, usernames, title, startDate, endDate, tags, id, comments=false, page=1, limit=16 } = query

    // Search a list of usernames
    if (usernames) {
      const usernamesArray = usernames.split(",")
      searchQuery["user.username"] = { $in: usernamesArray }
    }
    
    // Add the search query's properties to the searchQuery object
    if (userId) searchQuery["user.userId"] = userId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')
    if (id) searchQuery._id = id
    if (tags) searchQuery.tags = { $all: tags.split(",") }

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

      // Add a property to see is the video is in the users favorites array
      if (favoritedImages) {
        searchResults.forEach((doc) => {
          doc.favorited = favoritedImages.includes(doc._id.toString());
        });
      } else {
        searchResults.forEach((doc) => {
          doc.favorited = false;
        });
      }
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for images" ,
      data: {
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
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
    
    const { userId, usernames, title, startDate, endDate, tags, id, comments=false, page=1, limit=16 } = query

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
    if (id) searchQuery._id = id
    if (tags) searchQuery.tags = { $all: tags.split(",") }

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

      // Add a property to see is the video is in the users favorites array
      if (favoritedAudios) {
        searchResults.forEach((doc) => {
          doc.favorited = favoritedAudios.includes(doc._id.toString());
        });
      } else {
        searchResults.forEach((doc) => {
          doc.favorited = false;
        });
      }
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for audios" ,
      data: {
        resultCount: searchResults.length,
        totalDocuments: totalDocuments,
        page: page,
        pageCount: totalPages,
        limit: limit,
        query: query,
        searchResults: searchResults
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search for audios",
      errorMessage: error.message,
      error
    })
  }
}