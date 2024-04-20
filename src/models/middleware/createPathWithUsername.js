const path = require("path")

/* --------------------------------- Schemas -------------------------------- */
const User = require("../schemas/User")
/* -------------------------------------------------------------------------- */

module.exports = createPathWithUsername = async (req, res, next) => {
  const foundUser = await User.findById(req.userId)
  req.folder = path.join(process.cwd(), "/uploads", foundUser.folderId)
  next();
}