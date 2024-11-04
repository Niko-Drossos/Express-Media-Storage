const { Server } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const { uploadFile } = require('../helpers/gridFsMethods');
const router = require('express').Router();

// Set up GridFsStorage configuration with multer
const tusServer = new Server({
  path: '/testing/upload',
  datastore: new FileStore({ directory: './uploads' }),
})

// Route to handle file upload
router.all('/upload/*', tusServer.handle.bind(tusServer), (req, res) => {
  // Use the upload stream provided by tus or other streaming systems
  const fileStream = req.fileStream; // This would be your incoming file stream from tus
    console.log(fileStream)
  const file = {
    mimetype: "image/png", // Or wherever you get mimetype info
    originalname: req.headers['filename'], // For example, you can set it from client metadata
    duration: req.headers['duration'], // Add any additional metadata you want
    dimensions: req.headers['dimensions'],
  };
  
  /* tusServer.handle(req, res).then(() => {
    // uploadFile(req, fileStream, file)
    console.log("File uploaded!")
  }) */
  
  res.status(200).json({ message: 'File uploaded' })
  return 
});

module.exports = router