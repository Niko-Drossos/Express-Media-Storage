const { Readable, pipeline } = require('stream');
const mongodb = require("mongodb")
const multer = require('multer')

const dotenv = require("dotenv")
dotenv.config()

/* --------------------------------- Helpers -------------------------------- */
// TODO: Not yet implemented
// const videoCompressor = require('../../helpers/videoCompressor')
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

  // Either video, image, or audio
  const dbName = file.mimetype.split("/")[0];
  const db = client.db(dbName);
  const bucket = new mongodb.GridFSBucket(db);

  // Create a promise to wrap the pipeline operation
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const bufferStream = Readable.from(file.buffer);

    // Pipe the buffer stream through the video compressor
    const uploadStream = bufferStream.pipe(bucket.openUploadStream(file.originalname, {
      metadata: {
        // TODO: Add the ability to add your own file names besides original name
        // filename: file.originalname,

        // TODO: Add more tags like dimensions
        uploader: req.userId
      }
    }));

    // Listen for the 'finish' event on the upload stream
    uploadStream.on('finish', () => {
      // Retrieve the metadata of the uploaded file
      const metadata = uploadStream.file;
      console.log("Upload complete:", metadata);
      resolve(metadata);
    });

    // Listen for errors on the upload stream
    uploadStream.on('error', (error) => {
      console.error("Error:", error);
      reject(error);
    });
  });
};

/* -------------------------------------------------------------------------- */

// TODO: Incomplete
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

/* ------------------------------ Retrieve file ----------------------------- */

const retrieveFiles = async function(req, res, query) {
  const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)
  const db = client.db(query.mimetype)
  const bucket = new mongodb.GridFSBucket(db)
  
  // TODO: add query to retrieve files
  const bucketQuery = {

  }

  const cursor = bucket.find(bucketQuery)

  const foundFiles = []
  for await (const doc of cursor) {
    console.log(doc)
    foundFiles.push(doc)
  }

  return foundFiles
}

/* ------------------------------- Stream file ------------------------------ */

const streamFile = async function(req, res, fileName) {
  try {
    const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)
    // Get the mimetype from the url
    const dbName = req.originalUrl.split("/")[2];
    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db)
    
    const fileStream = bucket.openDownloadStreamByName(fileName)
      .on('error', (error) => {
        return res.status(404).json({
          success: false,
          message: `File: ${fileName} not found`,
          errorMessage: error.message,
          error
        })
      })
    
    fileStream.pipe(res);

    // Close the MongoDB connection once the response is finished
    res.on('finish', () => {
      client.close();
    });
  }
   catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch file",
      errorMessage: error.message,
      error
    })
  }
}

module.exports = { upload, uploadFile, uploadMultipleFiles, retrieveFiles, streamFile }
