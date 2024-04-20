const path = require("path")

module.exports = addDateToUrl = (req, res, next) => {
  req.dateFolder = path.join(req.url, req.params.date)
  next()
}