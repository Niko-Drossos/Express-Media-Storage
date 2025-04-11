const decryptJWT = require("../../helpers/decryptJWT");

/* ------------------------------- Middleware ------------------------------- */
const logError = require("../middleware/logging/logError")
/* -------------------------------------------------------------------------- */

// This is a similar middleware to authenticateUserJWT.
// The difference is that this works on the frontend to redirect them to the login page instead of throwing an error.

module.exports = userLoggedIn = async (req, res, next) => {
  try {
    // Don't us the middleware if user is trying to sign in
    // if (req.path.startsWith('/auth')) return next()

    const authentication =  req.cookies.media_authentication || req.headers["x-access-token"];
  
    /* if (!authentication) {
      return res.redirect(307, "/auth/login")
    } */

    let token
    if (authentication) {  
      token = decryptJWT(authentication)
    }

    // TODO: Make sure the token is not expired
    // console.log(token)

    /* if (!token) {
      return res.redirect(307, "/auth/login")
    } */

    req.userId = token?.payload?.userId || ""
    req.username = token?.payload?.username || ""
    req.email = token?.payload?.email || ""
    req.roles = token?.payload?.roles || []
    req.groups = token?.payload?.groups || []
    req.avatarId = token?.payload?.avatarId || ""
     
    next()
  } catch (error) {
    await logError(req, error)
    res.redirect(307, "/auth/login")
  }
}