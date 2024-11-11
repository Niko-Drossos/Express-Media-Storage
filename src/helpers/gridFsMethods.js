const { Readable } = require('stream')
const mongodb = require("mongodb")
const mongoose = require("mongoose")
const multer = require('multer')

const dotenv = require("dotenv")
dotenv.config()

// Multer storage configuration
const storage = multer.memoryStorage()

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Add any file filtering logic here if needed
    cb(null, true)
  }
})

/* -------------------------------------------------------------------------- */

// Middleware function to handle video compression upon upload

const uploadFile = async function(req, file) {
  const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)

  // Either video, image, or audio
  const dbName = file.mimetype.split("/")[0]
  const db = client.db(dbName)
  const bucket = new mongodb.GridFSBucket(db)

  // Create a promise to wrap the pipeline operation
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const bufferStream = Readable.from(file.buffer)

    const newFileName = `${req.username}-${file.originalname}`

    // Pipe the buffer stream through the video compressor
    const uploadStream = bufferStream.pipe(bucket.openUploadStream(newFileName, {
      metadata: {
        // Conditionally add the duration and dimensions to the metadata
        ...(file.duration && { duration: file.duration }),
        ...(file.dimensions && { dimensions: file.dimensions }),
        user: {
          userId: req.userId,
          username: req.username
        }
      }
    }))

    // Listen for the 'finish' event on the upload stream
    uploadStream.on('finish', () => {
      // Retrieve the ID of the uploaded file
      const fileId = uploadStream.id // Use uploadStream.id to access the _id property
      resolve(fileId) // Resolve with the file ID
    })

    // Listen for errors on the upload stream
    uploadStream.on('error', (error) => {
      console.error("Error:", error)
      reject(error)
    })
  })
}

/* ------------------------------ Retrieve file ----------------------------- */

// Maybe remove, I don't know what I would need this for
const retrieveFiles = async function(req, res, query) {
  const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)
  const db = client.db(query.mimetype)
  const bucket = new mongodb.GridFSBucket(db)
  
  // TODO: add query to retrieve files
  const bucketQuery = {}

  const { _id } = query

  if (_id) bucketQuery._id = new mongoose.Schema.Types.ObjectId(_id)

  const fetchFiles = bucket.find(bucketQuery)

  const foundFiles = []
  for await (const doc of fetchFiles) {
    foundFiles.push(doc)
  }

  return foundFiles
}

/* ------------------------------- Stream file ------------------------------ */

/* const streamFile = async function(req, res, fileId) {
  try {
    const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)
    // Get the mimetype from the url, this works because only the /view routes stream.
    const dbName = req.originalUrl.split("/")[2]
    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db)

    // Convert the fileId string to an ObjectId
    const searchId = new mongodb.ObjectId(fileId)
    
    const fileStream = bucket.openDownloadStream(searchId)
      .on('error', (error) => {
        return res.status(404).json({
          success: false,
          message: `File: ${fileId} not found in container: ${dbName}`,
          errorMessage: error.message,
          error
        })
      })
    
    fileStream.pipe(res)

    // Close the MongoDB connection once the response is finished
    res.on('finish', () => {
      client.close()
    })
  }
   catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch file",
      errorMessage: error.message,
      error
    })
  }
} */

const streamFile = async function (req, res, fileId) {
  try {
    const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri);
    const dbName = req.originalUrl.split("/")[2];
    const db = client.db(dbName);
    const bucket = new mongodb.GridFSBucket(db, { bucketName: "fs" });

    // Convert the fileId string to an ObjectId
    const searchId = new mongodb.ObjectId(fileId);

    // Check for the Range header
    const range = req.headers.range;
    if (!range) {
      // If no range header, return the whole file as usual
      const fileStream = bucket.openDownloadStream(searchId);
      res.setHeader("Content-Type", "video/mp4");
      fileStream.pipe(res);

      // Close MongoDB connection when done
      res.on("finish", () => {
        client.close();
      });
      return;
    }

    // Parse the range, assuming it looks like "bytes=start-end"
    const [start, end] = range.replace(/bytes=/, "").split("-").map(Number);
    
    // Get file metadata (optional but useful for Content-Length)
    const fileInfo = await bucket.find({ _id: searchId }).toArray();
    // console.log(fileInfo)
    if (!fileInfo.length) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const fileSize = fileInfo[0].length;
    const chunkEnd = end ? end : fileSize - 1;

    // Set Cache-Control and Last-Modified headers for caching
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("Last-Modified", fileInfo[0].uploadDate.toUTCString());
    res.setHeader("ETag", fileInfo[0]._id.toString());


    // Set response headers for partial content
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${chunkEnd}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkEnd - start + 1,
      "Content-Type": "video/mp4" // Adjust MIME type as needed
    });

    // Stream the requested byte range
    const fileStream = bucket.openDownloadStream(searchId, { start, end: chunkEnd });
    
    // Pipe stream to response and handle errors
    fileStream.pipe(res)
      .on('error', (error) => {
        console.error('Stream error:', error);
        res.status(500).end();
        client.close();
      });

    // Ensure connection stays open until the streaming completes
    /* res.on("close", () => {
      console.log("Connection closed by client");
      fileStream.destroy();
    }); */

    // If playback is finished naturally, close Mongo connection
    /* res.on("finish", () => {
      client.close();
    }); */
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch file",
      errorMessage: error.message,
      error
    });
  }
};
  

/* ------------------------------- Delete file ------------------------------ */

const deleteFiles = async function(req, res, query) {
  try {
    const client = new mongodb.MongoClient(process.env.Mongo_Connection_Uri)
    const dbName = query.mimetype
    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db)

    // Make the list of file id's an ObjectId instance
    const deleteIds = query.fileIds.map(id => new mongoose.Schema.Types.ObjectId(id))

    const fetchFiles = bucket.find({ _id: { $in: deleteIds } })

    // Convert the fetchFiles into an array, otherwise it wont work
    const foundFiles = []
    for await (const doc of fetchFiles) {
      foundFiles.push(doc)
    }

    const deletedResults = foundFiles.map(file => {
      if (file.metadata.user == req.userId) {
        bucket.delete(new mongodb.ObjectId(file._id))
        return {
          success: true,
          message: "Successfully deleted file",
          data: {
            filename: file.filename,
            fileId: file._id
          }
        }
      } else {
        return {
          success: false,
          message: "You are not authorized to delete this file",
          data: {
            filename: file.filename,
            fileId: file._id
          }
        }
      }
    })

    return deletedResults 
  } catch (error) { 
    throw error
  }
}


module.exports = { upload, uploadFile, retrieveFiles, streamFile, deleteFiles }
