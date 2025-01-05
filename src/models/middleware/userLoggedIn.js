const decryptJWT = require("../../helpers/decryptJWT");

// This is a similar middleware to authenticateUserJWT.
// The difference is that this works on the frontend to redirect them to the login page instead of throwing an error.

module.exports = userLoggedIn = (req, res, next) => {
  try {
    const authentication =  req.cookies.media_authentication || req.headers["x-access-token"];

    const token = decryptJWT(authentication)

    // Make sure its not expired
    console.log(token)

    if (!token) {
      return res.redirect(301, "/auth/login")
    }
     
    next()
  } catch (error) {
    // res.redirect(301, "/auth/login")
    console.log(error)
  }
}