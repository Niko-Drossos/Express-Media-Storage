const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* --------------------------------- Helpers -------------------------------- */
const decryptJWT = require("../helpers/decryptJWT")
/* -------------------------------------------------------------------------- */

/* --------------------------- Search for users by name ----------------------- */

/* ------------------ Search for posts within a time frame ------------------ */

// ! NOT FINISHED 
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query

    // Object that will be searched for in the db
    const searchQuery = {}

    if (query?.posterId) searchQuery._id = query.posterId

    // const searchResults = await Post.find(searchQuery)
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully searched for posts" ,
      data: {
        // searchResults,
        query
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
