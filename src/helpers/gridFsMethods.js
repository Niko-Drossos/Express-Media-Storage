const { MongoClient, GridFSBucket, ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const sharp = require('sharp');

const multer = require('multer')

const dotenv = require("dotenv")
dotenv.config()

/* --------------------------------- Schemas -------------------------------- */
const Upload = require("../models/schemas/Upload")
// const Video = require("../models/schemas/Video")
// const Audio = require("../models/schemas/Audio")
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Helpers -------------------------------- */
const getFileExt = require('./getFileExt')
/* -------------------------------------------------------------------------- */


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

// Create a connection to MongoDB and store it for all future requests
const mongoUri = process.env.Mongo_Connection_Uri
const dbName = 'files'
let db, videoBucket, audioBucket, imageBucket

// Start up a client for GridFSfile uploads
async function initializeGridFS() {
  const client = await MongoClient.connect(mongoUri)
  db = client.db(dbName)

  // Initialize multiple buckets for different media types
  videoBucket = new GridFSBucket(db, { bucketName: 'media', chunkSizeBytes: 4 * 1024 * 1024 }) // 4 MB Chunks
  audioBucket = new GridFSBucket(db, { bucketName: 'media', chunkSizeBytes: 2 * 1024 * 1024 }) // 2 MB Chunks
  imageBucket = new GridFSBucket(db, { bucketName: 'media', chunkSizeBytes: 512 * 1024 }) // 512KB Chunks
}


(async () => {
  // Wait for GridFS to initialize before running the rest of the file
  await initializeGridFS()
})()

/* ----------------------------- Upload mapping ----------------------------- */

// Keeps track of all ongoing uploads
const uploadStreams = new Map()

// Create a map to store the timers for file uploads
// Upload streams will be destroyed if the client doesn't send any data for 1 minute
const fileTimers = new Map()

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

const streamFile = async function (req, res, fileId, mimeType, thumbnail = false) {
  try {
    let bucket
    // Select the bucket based on the MIME type
    switch (mimeType) {
      case 'video':
        bucket = videoBucket
        break
      case 'image':
        bucket = imageBucket
        break
      case 'audio':
        bucket = audioBucket
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid MIME type',
          errorMessage: 'Invalid MIME type provided',
          error: {}
        })
    }

    // Convert fileId to ObjectId
    const searchId = new ObjectId(fileId)

    // Find file metadata to get its length
    const file = await bucket.find({ _id: searchId }).next()
    if (!file) {
      return res.status(404).json({
        success: false,
        message: `File: ${fileId} not found in container`,
        errorMessage: `File: ${fileId} not found in container`,
        error: {}
      })
    }

    // Create a header for the Content-Type
    const contentType = `${mimeType}/${getFileExt(file.filename)}`

    if (mimeType === 'image' && thumbnail) {
      const sharp = require('sharp') // ensure you've installed it via npm
      res.writeHead(200, {
        'Content-Type': 'image/jpeg'
      })
      return bucket
        .openDownloadStream(searchId)
        .pipe(sharp().resize({ width: 300, height: 200 }).jpeg())
        .pipe(res)
    }

    const fileSize = file.length
    const range = req.headers.range
    if (range) {
      // Parse the Range header
      const [start, end] = range.replace(/bytes=/, '').split('-')
      const startByte = parseInt(start, 10)
      const endByte = end ? parseInt(end, 10) : fileSize - 1
      const chunkSize = endByte - startByte + 1
      
      // Set partial content headers
      res.writeHead(206, {
        'Content-Range': `bytes ${startByte}-${endByte}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      })

      // Create a stream for the requested range
      bucket.openDownloadStream(searchId, { start: startByte, end: endByte + 1 }).pipe(res)
    } else {
      res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
      })
      bucket.openDownloadStream(searchId).pipe(res)
    }

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file',
      errorMessage: error.message,
      error,
    })
  }
}

/* ------------------------------- Delete file ------------------------------ */

const deleteFiles = async function(req, res, query) {
  try {
    const client = new MongoClient(process.env.Mongo_Connection_Uri)
    const dbName = query.mimetype
    const db = client.db(dbName)
    const bucket = new GridFSBucket(db)

    // Make the list of file id's an ObjectId instance
    const deleteIds = query.fileIds.map(id => new ObjectId(id))

    const fetchFiles = bucket.find({ _id: { $in: deleteIds } })

    // Convert the fetchFiles into an array, otherwise it wont work
    const foundFiles = []
    for await (const doc of fetchFiles) {
      foundFiles.push(doc)
    }

    // TODO: Add checking for authorization here
    const deletedResults = foundFiles.map(file => {
      bucket.delete(new ObjectId(file._id))
      return {
        success: true,
        message: "Successfully deleted file",
        data: {
          filename: file.filename,
          fileId: file._id
        }
      }
    })

    return deletedResults 
  } catch (error) { 
    await logError(req, error)
    throw error
  }
}

/* ------------------------ Start gridFS chunk upload ----------------------- */

const startChunkedUpload = async (req, res) => {
  const { metadata } = req.body
  const generatedFileName = req.generatedFileName

  // Save the file metadata to add to the upload stream
  const fileMetadata = {
    ...metadata,
    user: req.userId
  }

  let uploadStream

  // Open up a new upload stream for the file to be written to and save the metadata with it.
  // Use a different bucket depending on the mimeType of the file
  switch(metadata.mediaType) {
    case "video":
      uploadStream = videoBucket.openUploadStream(generatedFileName, fileMetadata)
      break
    case "image":
      uploadStream = imageBucket.openUploadStream(generatedFileName, fileMetadata)
      break
    case "audio":
      uploadStream = audioBucket.openUploadStream(generatedFileName, fileMetadata)
      break
  }

  if (!uploadStream) {
    throw new Error(`Failed to open upload stream with mime type: ${mimeType}`)
  }

  // Get the files _id to be used as a key
  const fileId = uploadStream.id.toString()

  // I generate a document _id for the document so that it is initialized when you start the upload
  // This is to prevent having to send the document _id back to the client ad a lot of other things
  const documentId = new mongoose.Types.ObjectId()

  uploadStreams.set(fileId, { uploadStream, mediaType: metadata.mediaType, documentId, uploadStartedAt: Date.now() })

  return  { uploadStream, fileId, documentId }
}

/* ---------------------- Upload a file chunk to GridFS --------------------- */

const uploadChunk = async (req, res) => {
  let { chunkIndex, totalChunks, fileId, fileExt } = req.body

  // Make chunkIndex and totalChunks into numbers
  chunkIndex = Number(chunkIndex)
  totalChunks = Number(totalChunks)

  // Ensure the file was uploaded by multer
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: 'No file chunk uploaded',
      data: { chunkIndex, totalChunks, fileId }
    })
  }

  const chunkBuffer = req.file.buffer
  const { uploadStream, mediaType, documentId } = uploadStreams.get(fileId)

  // Check if the upload stream exists
  if (!uploadStream) {
    return res.status(404).json({
      success: false,
      message: 'No upload stream found',
      data: { chunkIndex, totalChunks, fileId }
    })
  }

  // Reset or initialize the timer for this file
  if (fileTimers.has(fileId)) {
    clearTimeout(fileTimers.get(fileId)) // Clear the existing timer
  }

  // Set a timer for the upload stream to be cleaned up
  const timer = setTimeout(async () => {
    console.warn(`Upload for file ${fileId} timed out.`)
    uploadStream.filename = `DELETE-${uploadStream.options.filename}` // Update the filename so if it doesn't get deleted you know the file was deleted 
    uploadStream.end() // Destroy the upload stream
    uploadStreams.delete(fileId) // Remove from the uploadStreams map
    clearTimeout(fileTimers.get(fileId)) // Stop the old timer
    fileTimers.delete(fileId) // Remove from the timers map

    try {
      // Delete the document in the proper collection
      await Upload.findByIdAndDelete(documentId)
      // Remove partial file from GridFS
      await cleanupDeletedChunks(mediaType, fileId)
      console.log(`Timed-out file ${fileId} deleted successfully.`)
    } catch (error) {
      console.error(`Failed to delete timed-out file ${fileId}:`, error)
    } finally {
      await logError(req, error = { message: `Timed-out file ${fileId} deleted successfully.` })
    }
  }, 60 * 1000) // 60 seconds

  fileTimers.set(fileId, timer) // Save the new timer

  try {
    // Write the chunk to the upload stream
    await new Promise((resolve, reject) => {
      const writeResult = uploadStream.write(chunkBuffer, (err) => {
        if (err) reject(err) // Handle write errors
        resolve()
      })

      if (writeResult === false) {
        // Handle backpressure if needed
        uploadStream.once('drain', resolve)
      }
    })

    // If this is the last chunk, finalize the upload stream
    if (chunkIndex === totalChunks - 1) {
      await new Promise((resolve, reject) => {
        uploadStream.end(async () => {
          uploadStreams.delete(fileId) // Clean up the stream
          clearTimeout(fileTimers.get(fileId)) // Stop the timer so the file doesn't delete itself after upload
          fileTimers.delete(fileId) // Remove the timer from the map
          await Upload.findByIdAndUpdate(documentId, { status: "completed" }) // Delete the document
          resolve()
        })
        uploadStream.on('error', reject) // Handle errors during end
      })
    }

    const uploadPercentage = Math.round(((chunkIndex + 1) / totalChunks) * 100, 2) // round percentage to 2 decimal places

    console.log(`Upload percentage: ${uploadPercentage}`)

    // Send success response after processing the chunk
    return res.json({
      success: true,
      message: 'Chunk uploaded',
      data: {
        chunkIndex,
        totalChunks,
        fileId,
        uploadPercentage
      }
    })
  } catch (err) {
    console.error('Error during chunk upload:', err)

    // Send error response
    return res.status(500).json({
      success: false,
      message: 'Failed to upload chunk',
      data: { chunkIndex, totalChunks, fileId, error: err.message }
    })
  }
}

/* ------------------------------ Small upload ------------------------------ */
// This is used for small image uploads for thumbnails and user avatars

const smallUpload = async (req, res) => {
  try {
    const generatedFileName = `${req.userId}-${req.file.originalname}`
    const fileMetadata = {
      user: req.userId,
      type: "avatar"
    }

    // Resize image to 200x200 using sharp before upload
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(200, 200)
      .jpeg()
      .toBuffer()

    const uploadStream = imageBucket.openUploadStream(generatedFileName, fileMetadata)

    if (!uploadStream) {
      throw new Error(`Failed to open upload stream with mime type: ${mediaType}`)
    }

    // Get the files _id to be used as a key
    const fileId = uploadStream.id.toString()

    uploadStreams.set(fileId, { uploadStream, mediaType: "image", documentType: Upload, uploadStartedAt: Date.now() })

    await new Promise((resolve, reject) => {
      const writeResult = uploadStream.write(resizedBuffer, (err) => {
        if (err) reject(err) // Handle write errors
        resolve()
      })

      if (writeResult === false) {
        // Handle backpressure if needed
        uploadStream.once('drain', resolve)
      }
    })

    // End the file upload
    await new Promise((resolve, reject) => {
      uploadStream.end(async () => {
        uploadStreams.delete(fileId) // Clean up the stream
        resolve()
      })
      uploadStream.on('error', reject) // Handle errors during end
    })

    // I generate a document _id for the document so that it is initialized when you start the upload
    // This is to prevent having to send the document _id back to the client ad a lot of other things
    // const documentId = new mongoose.Types.ObjectId()


    return fileId 
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      errorMessage: error.message,
      error
    })
  }
}
  

/* ------------------ Clean up orphaned chunks from GridFS ------------------ */

async function cleanupDeletedChunks(bucketName, fileId) {
  try {
    const chunksCollection = db.collection(`${bucketName}.chunks`)
    const filesCollection = db.collection(`${bucketName}.files`)

    console.log(`Checking for orphaned chunks in ${bucketName} bucket...`)

    // Find orphaned chunks that have the filename DELETED-{filename}
    const orphanedChunks = await chunksCollection.aggregate([
      {
        $lookup: {
          from: `${bucketName}.files`, // Join with the files collection
          localField: 'files_id',     // Match the files_id in chunks
          foreignField: '_id',        // Match the _id in files
          as: 'file',
        },
      },
      {
        $unwind: {
          path: '$file',             // Unwind the joined file array
          preserveNullAndEmptyArrays: true, // Preserve null for orphaned chunks
        },
      },
      {
        $match: {
          files_id: new mongoose.Types.ObjectId(fileId), // Match chunks with the fileId to get deleted
        },
      },
    ]).toArray();

    // Delete orphaned file from files collection
    const deletedFile = await filesCollection.deleteOne({ _id: new mongoose.Types.ObjectId(fileId) })
    console.log(`Deleted file ${fileId} from ${bucketName} bucket.`)

    if (orphanedChunks.length > 0) {
      const idsToDelete = orphanedChunks.map((chunk) => chunk._id)

      // Delete orphaned chunks
      await chunksCollection.deleteMany({ _id: { $in: idsToDelete } })
      console.log(`Deleted ${idsToDelete.length} orphaned chunks from ${bucketName} bucket.`)
    } else {
      console.log(`No orphaned chunks found in ${bucketName} bucket.`)
    }
  } catch (err) {
    console.error(`Error cleaning orphaned chunks from ${bucketName} bucket:`, err)
  }
}

/* -------- Get a readable stream from a GridFS file for internal use ------- */

const createTempFile = async (fileId, mimeType) => {
  try {
    let bucket
    switch (mimeType) {
      case 'video':
        bucket = videoBucket
        break
      case 'audio':
        bucket = audioBucket
        break
    }

    const searchId = new ObjectId(fileId);

    // Create /tmp/transcription directory if it doesn't exist
    const transcriptionDir = path.join(os.tmpdir(), 'transcription');

    if (!fs.existsSync(transcriptionDir)) {
      fs.mkdirSync(transcriptionDir, { recursive: true });
    }
    
    // Create .tmp file
    const tempFilePath = path.join(transcriptionDir, `${fileId}.tmp`);
    const tempFileStream = fs.createWriteStream(tempFilePath);

    // Create a read stream from GridFS
    const downloadStream = bucket.openDownloadStream(searchId);

    // Pipe the download stream to the temporary file
    downloadStream.pipe(tempFileStream);

    // Return a promise that resolves when the file is fully written
    return new Promise((resolve, reject) => {
      downloadStream.on('error', (error) => {
        fs.unlink(tempFilePath, () => reject(error)); // Clean up temp file on error
      });

      tempFileStream.on('error', (error) => {
        fs.unlink(tempFilePath, () => reject(error)); // Clean up temp file on error
      });

      tempFileStream.on('finish', () => {
        resolve(tempFilePath);
      });
    });
  } catch (error) {
    await logError(req, error)
    throw error;
  }
}

/* -------------------------------------------------------------------------- */

module.exports = { upload, retrieveFiles, streamFile, deleteFiles, uploadChunk, startChunkedUpload, uploadStreams, createTempFile, smallUpload }
