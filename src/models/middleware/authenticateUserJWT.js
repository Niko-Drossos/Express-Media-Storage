const decryptJWT = require("../../helpers/decryptJWT");

// Decode JWT middleware to extract the user ID
module.exports = authenticateUserJWT = (req, res, next) => {
  try {

    const token = req.cookies.media_authentication || req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, please log in",
      });
    }

    const decodedToken = decryptJWT(token);

    const { payload } = decodedToken

    req.userId = payload.userId || null
    req.username = payload.username || null
    req.email = payload.email || null
    req.roles = payload.roles || []
    req.groups = payload.groups || []
    
    next()
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Failed to validate user",
      errorMessage: error.message,
      error
    })
  }
}