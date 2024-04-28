const dotenv = require("dotenv")
dotenv.config()

const { Readable, pipeline } = require('stream');
const mongodb = require("mongodb")
const multer = require('multer')
const path = require('path')
const fs = require('fs')

/* --------------------------------- Helpers -------------------------------- */
const videoCompressor = require('../../helpers/videoCompressor')
const decryptJWT = require('../../helpers/decryptJWT')
/* -------------------------------------------------------------------------- */

// Multer storage configuration
const storage = multer.memoryStorage()

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Add any file filtering logic here if needed
    cb(null, true);
  }
});

/* -------------------------------------------------------------------------- */

// Middleware function to handle video compression upon upload
const uploadFile = async function(req, res, file) {
  const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri);
  const userPayload = decryptJWT(req.headers.authorization).payload
  console.log(file)

  const dbName = file.mimetype.split("/")[0]
  const db = client.db(dbName);
  const bucket = new mongodb.GridFSBucket(db);

  // Create a readable stream from the buffer
  const bufferStream = new Readable();
  bufferStream.push(file.buffer);
  bufferStream.push(null); // Signal the end of the stream

  // Pipe the buffer stream through video compressor
  pipeline(
    bufferStream,
    // videoCompressor(),
    bucket.openUploadStream(file.originalname),
    (error) => {
      if (error) {
        console.error(error)
      } else {
        console.log("Yippie!")
      }
    }
  )
}

/* -------------------------------------------------------------------------- */

const uploadMultipleFiles = function(req, res, next) {
  req.files.map(file => uploadFile(req, res, next, file))
  /* uploadFile(req, res, function(error) {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error uploading file', 
        errorMessage: error.message,
        error
      })
    }
    next()
  }) */
  next()
}

module.exports = { upload, uploadFile, uploadMultipleFiles }
