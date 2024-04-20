const path = require("path")

module.exports = createPathWithUsername = (req, res, next) => {
  req.folder = path.join(process.cwd(), "/uploads", req.userId);
  next();
}