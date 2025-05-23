/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Upload = require("../models/schemas/Upload")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* -------------------------------------------------------------------------- */

/* -------------------- Search usernames for autocomplete ------------------- */

exports.usernames = async (req, res) => {
  try {
    const partialUsername = req.query.query || ""

    const users = await User.find({ username: new RegExp(partialUsername, 'i') })
      .limit(10)
      .select('username -_id');

    const usernames = users.map(user => user.username)

    res.status(200).json({
      success: true,
      message: "Fetched users",
      data: {
        suggestions: usernames
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for usernames",
      errorMessage: error.message,
      error
    })   
  }
}

/* ---------------------- Search tags for autocomplete ---------------------- */

exports.tags = async (req, res) => {
  try {
    const partialTag = req.query.query || ""

    const tagDocs = await Upload.aggregate([
      { $match: { tags: { $regex: partialTag, $options: 'i' } } }, // Match partial tag
      { $unwind: '$tags' }, // Flatten tags array
      // { $match: { tags: { $regex: partialTag, $options: 'i' } } }, // Match again to filter unwound tags
      { $group: { _id: '$tags' } }, // Deduplicate tags
      { $project: { tag: '$_id', _id: 0 } }, // Format output
      { $sort: { tag: 1 } }, // Sort alphabetically (adjust as needed)
      { $limit: 10 } // Limit to 10 tags
    ]);

    const tags = tagDocs.map(tag => tag.tag)

    res.status(200).json({
      success: true,
      message: "Fetched tags",
      data: {
        suggestions: tags
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to search for tags",
      errorMessage: error.message,
      error
    })   
  }
}