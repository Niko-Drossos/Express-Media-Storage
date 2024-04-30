const processUploads = (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }

  // Store uploaded files in req.uploads array
  req.uploads = req.files.map(file => file)
  
  next()
}

module.exports = processUploads