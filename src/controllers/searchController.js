const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
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
    
    const { username } = query

    // Add the search query's properties to the searchQuery object
    if (username) searchQuery.username = new RegExp(username, 'i')

    // TODO: Add tags to users later
    // if (tags) searchQuery.tags = tags.split(",")

    const searchResults = await User.find(searchQuery)

    res.status(200).json({
      success: true,
      message: "Successfully searched for users",
      data: {
        userCount: searchResults.length,
        query,
        searchResults
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

/* ------------------ Search for posts within a time frame ------------------ */

exports.searchPosts = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}
    
    const { posterId, tags, startDate, endDate, title } = query

    // Add the search query's properties to the searchQuery object
    if (posterId) searchQuery.user = posterId
    if (tags) searchQuery.tags = tags.split(",")
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.title = new RegExp(title, 'i')

    const searchResults = await Post.find(searchQuery)
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully searched for posts" ,
      data: {
        postCount: searchResults.length,
        query,
        searchResults
      }
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to search for posts",
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
    
    const { posterId, originId, startDate, endDate, content } = query

    // Add the search query's properties to the searchQuery object
    if (posterId) searchQuery.user = posterId
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (content) searchQuery.content = new RegExp(content, 'i')
    if (originId) searchQuery.originId = originId

    const searchResults = await Comment.find(searchQuery)
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for comments" ,
      data: {
        commentCount: searchResults.length,
        query,
        searchResults
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
    
    const { uploader, title, startDate, endDate } = query

    // Add the search query's properties to the searchQuery object
    if (uploader) searchQuery.user = uploader
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.content = new RegExp(title, 'i')

    const searchResults = await Video.find(searchQuery)
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for videos" ,
      data: {
        imageCount: searchResults.length,
        query,
        searchResults
      }
    })
  } catch (error) {
    res.json({
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
    
    const { uploader, title, startDate, endDate } = query

    // Add the search query's properties to the searchQuery object
    if (uploader) searchQuery.user = uploader
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.content = new RegExp(title, 'i')

    const searchResults = await Image.find(searchQuery)
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for images" ,
      data: {
        imageCount: searchResults.length,
        query,
        searchResults
      }
    })
  } catch (error) {
    res.json({
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
    
    const { uploader, title, startDate, endDate } = query

    // Add the search query's properties to the searchQuery object
    if (uploader) searchQuery.user = uploader
    if (startDate || endDate) searchDateRange(searchQuery, startDate, endDate)
    if (title) searchQuery.content = new RegExp(title, 'i')

    const searchResults = await Audio.find(searchQuery)
    
    res.status(200).json({
      success: true, 
      message: "Successfully searched for audios" ,
      data: {
        imageCount: searchResults.length,
        query,
        searchResults
      }
    })
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to search for audios",
      errorMessage: error.message,
      error
    })
  }
}