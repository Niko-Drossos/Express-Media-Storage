// This is a similar middleware to authenticateUserJWT.
// The difference is that this works on the frontend to redirect them to the login page instead of throwing an error.

module.exports = userLoggedIn = (req, res, next) => {
  const token = req.cookies.media_authentication || req.headers["x-access-token"];

  if (!token) {
    return res.redirect(301, "/auth/login")
  }

  next()
}