/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
/* ------------------------------- Middleware ------------------------------- */

/* --------------------------------- Helpers -------------------------------- */

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
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      errorMessage: error.message,
      error
    })
  }
}