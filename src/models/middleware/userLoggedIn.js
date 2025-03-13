const decryptJWT = require("../../helpers/decryptJWT");

/* ------------------------------- Middleware ------------------------------- */
const logError = require("../middleware/logging/logError")
/* -------------------------------------------------------------------------- */

// This is a similar middleware to authenticateUserJWT.
// The difference is that this works on the frontend to redirect them to the login page instead of throwing an error.

module.exports = userLoggedIn = async (req, res, next) => {
  try {
    const authentication =  req.cookies.media_authentication || req.headers["x-access-token"];
    const token = decryptJWT(authentication)

    // TODO: Make sure the token is not expired
    // console.log(token)

    if (!token) {
      return res.redirect(307, "/auth/login")
    }

    req.userId = token.payload.userId
    req.username = token.payload.username
     
    next()
  } catch (error) {
    await logError(req, error)
    res.redirect(307, "/auth/login")
  }
}