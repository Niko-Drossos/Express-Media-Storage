const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const ffmpeg = require('fluent-ffmpeg');
const Upload = require("../models/schemas/Upload");
const { createGridFSWriteStream, upload, startChunkedUpload, uploadChunk, smallUpload } = require("../helpers/gridFsMethods");
const logError = require("../models/middleware/logging/logError");
const mongoose = require('mongoose');

// Reference to the MongoDB store
let sessionStore;

// Function to initialize the session store reference
exports.initSessionStore = (store) => {
  sessionStore = store;
};

exports.startChunkUpload = async (req, res) => {
  try {
    const { metadata } = req.body;
    
    // Validate the metadata object
    if (!metadata) {
      return res.status(400).json({
        success: false,
        message: "Missing metadata in request body",
        error: "Metadata is required"
      });
    }

    // Validate required metadata fields
    if (!metadata.fileName) {
      return res.status(400).json({
        success: false, 
        message: "Missing fileName in metadata",
        error: "fileName is required in metadata"
      });
    }
    
    // Generate unique upload ID
    const uploadId = `${req.userId}-${Date.now()}`;
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'media-uploads');
    await fs.ensureDir(tempDir);
    
    // Create temporary file path
    const tempFilePath = path.join(tempDir, `${uploadId}-${metadata.fileName}`);
    
    // Store upload metadata in session
    if (!req.session.uploads) {
      req.session.uploads = {};
    }
    
    req.session.uploads[uploadId] = {
      tempFilePath,
      fileName: metadata.fileName,
      totalChunks: parseInt(metadata.totalChunks || 0),
      receivedChunks: 0,
      startTime: Date.now(),
      metadata: metadata
    };
    
    // Save session immediately to ensure it's stored before the response is sent
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create document ID
    const documentId = new mongoose.Types.ObjectId();
    
    // Create the document
    const documentBody = {
      _id: documentId,
      title: metadata.title || metadata.fileName.split(".").slice(0, -1).join("."),
      filename: `${req.userId}-${metadata.fileName}`,
      description: metadata.description || "",
      fileId: uploadId,
      date: metadata.date ? new Date(metadata.date) : Date.now(),
      privacy: metadata.privacy,
      user: req.userId,
      tags: metadata.tags ? metadata.tags.split(",") : [],
      status: "uploading",
      mediaType: metadata.mediaType
    };

    const document = await Upload.create(documentBody);

    // Add debug logging to verify session was saved
    console.log(`Session created for upload ${uploadId}. Session ID: ${req.sessionID}`);

    res.status(200).json({
      success: true,
      message: "Initialized chunked upload",
      data: {
        uploadId,
        sessionId: req.sessionID, // Send the session ID back to the client
        fileId: document._id
      }
    });
  } catch (error) {
    await logError(req, error);
    res.status(500).json({
      success: false,
      message: "Failed to start chunked upload",
      error: error.message
    });
  }
};

exports.chunkedUpload = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, sessionId } = req.body;
    
    // Debug logging
    console.log(`Processing chunk for upload ${uploadId}. Session ID: ${req.sessionID}`);
    console.log(`Session data:`, req.session);
    
    // Validate session and upload data
    if (!req.session.uploads || !req.session.uploads[uploadId]) {
      // If the session data is missing, try to recover it from the database
      if (sessionId) {
        try {
          const recoveredSession = await recoverSession(sessionId, uploadId);
          if (recoveredSession) {
            req.session.uploads = req.session.uploads || {};
            req.session.uploads[uploadId] = recoveredSession;
          } else {
            throw new Error('Could not recover upload session');
          }
        } catch (err) {
          console.error('Session recovery failed:', err);
          throw new Error('Upload session not found and recovery failed');
        }
      } else {
        throw new Error('Upload session not found');
      }
    }

    const uploadSession = req.session.uploads[uploadId];
    const tempFilePath = uploadSession.tempFilePath;

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(tempFilePath));
    
    // Append chunk to temporary file
    await fs.appendFile(tempFilePath, req.file.buffer);
    
    // Update received chunks count
    uploadSession.receivedChunks++;
    
    // Save session after updating
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // If this is the last chunk
    if (uploadSession.receivedChunks === parseInt(totalChunks)) {
      // Process the complete file
      await processCompleteFile(tempFilePath, uploadId, req, res);
      
      // Clean up session data
      delete req.session.uploads[uploadId];
      await new Promise((resolve, reject) => {
        req.session.save(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Calculate the upload percentage
      const uploadPercentage = Math.round((uploadSession.receivedChunks / parseInt(totalChunks)) * 100);

      res.status(200).json({
        success: true,
        message: "Chunk uploaded successfully",
        data: {
          progress: {
            received: uploadSession.receivedChunks,
            total: totalChunks
          },
          uploadPercentage: uploadPercentage
        }
      });
    }
  } catch (error) {
    await logError(req, error);
    res.status(500).json({
      success: false,
      message: "Failed to process chunk",
      error: error.message
    });
  }
};

// Function to recover session data from database
async function recoverSession(sessionId, uploadId) {
  if (!sessionStore) {
    console.error('Session store not initialized');
    return null;
  }
  
  return new Promise((resolve, reject) => {
    sessionStore.get(sessionId, (err, session) => {
      if (err) {
        console.error('Error retrieving session:', err);
        reject(err);
      } else if (session && session.uploads && session.uploads[uploadId]) {
        resolve(session.uploads[uploadId]);
      } else {
        resolve(null);
      }
    });
  });
}

async function processCompleteFile(tempFilePath, uploadId, req, res) {
  // Add file extension to the optimized path
  const fileExt = path.extname(tempFilePath);
  const optimizedTempPath = `${tempFilePath.replace(fileExt, '')}_optimized${fileExt}`;
  
  try {
    // Get the file extension without the dot
    const fileExtLower = fileExt.toLowerCase();
    
    // Only process video files
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(fileExtLower)) {
      console.log(`Processing video file: ${tempFilePath}`);
      console.log(`Optimized output will be saved to: ${optimizedTempPath}`);
      
      // Make sure the output directory exists
      await fs.ensureDir(path.dirname(optimizedTempPath));
      
      try {
        // Process the file with ffmpeg to optimize it
        await new Promise((resolve, reject) => {
          ffmpeg(tempFilePath)
            .outputOptions([
              '-movflags +faststart',  // Move moov atom to beginning
              '-c:v copy',            // Copy video stream without re-encoding
              '-c:a copy'             // Copy audio stream without re-encoding
            ])
            .output(optimizedTempPath) // Use output instead of save
            .on('end', resolve)
            .on('error', (err) => {
              console.error('FFmpeg error:', err);
              reject(err);
            })
            .run(); // Add explicit run()
        });
        
        console.log('Video optimization complete');
      } catch (ffmpegError) {
        console.error('FFmpeg processing failed, falling back to direct copy:', ffmpegError);
        
        // If FFmpeg fails, just copy the file as a fallback
        await fs.copy(tempFilePath, optimizedTempPath);
        console.log('Fallback: Copied original file without optimization');
      }
    } else {
      // For non-video files, just copy the file
      await fs.copy(tempFilePath, optimizedTempPath);
      console.log(`Non-video file copied: ${optimizedTempPath}`);
    }

    // Now upload the file to GridFS using the methods already available in gridFsMethods
    console.log('Uploading file to GridFS');
    
    // Determine media type from file extension
    let mediaType;
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(fileExtLower)) {
      mediaType = 'video';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtLower)) {
      mediaType = 'image';
    } else if (['.mp3', '.wav', '.ogg', '.aac', '.flac'].includes(fileExtLower)) {
      mediaType = 'audio';
    } else {
      mediaType = 'image'; // Default to image
    }
    
    // Read the file buffer
    const fileBuffer = await fs.readFile(optimizedTempPath);
    
    // Get original filename from the path
    const originalFileName = path.basename(tempFilePath);
    
    // Generate a filename for GridFS
    req.generatedFileName = `${req.userId}-${Date.now()}-${originalFileName}`;
    console.log(`Generated filename for GridFS: ${req.generatedFileName}`);
    
    // Create a fake metadata object
    const metadata = {
      fileName: originalFileName,
      mediaType: mediaType,
      title: originalFileName.split(".")[0], // Remove extension for title
      privacy: "Private",
      // Include any other metadata needed
    };
    
    // Save the original request body
    const originalBody = req.body;
    
    // Set a new request body with metadata for startChunkedUpload
    req.body = { metadata };
    
    // Get a GridFS upload stream
    const { uploadStream, fileId: gridFsFileId, documentId } = await startChunkedUpload(req, res);
    
    // Write the file buffer to the upload stream
    await new Promise((resolve, reject) => {
      uploadStream.end(fileBuffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Restore the original request body
    req.body = originalBody;
    
    console.log(`File uploaded to GridFS with ID: ${gridFsFileId}`);
    
    // Find the Upload document using proper query and update it correctly
    const uploadDocument = await Upload.findOne({ fileId: uploadId });
    
    if (!uploadDocument) {
      console.error(`Could not find Upload document with fileId: ${uploadId}`);
      throw new Error('Upload document not found');
    }
    
    console.log(`Found Upload document: ${uploadDocument._id}`);
    
    // Update the document with the correct fields
    uploadDocument.status = "completed";
    uploadDocument.fileId = gridFsFileId; // Update the fileId field with the GridFS ID
    
    // Save the updated document
    await uploadDocument.save();
    
    console.log(`Updated Upload document with GridFS fileId: ${gridFsFileId}`);

    // Clean up temporary files
    try {
      await fs.remove(tempFilePath);
      await fs.remove(optimizedTempPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(201).json({
      success: true,
      message: "File upload completed and optimized successfully",
      data: {
        fileId: gridFsFileId,
        uploadId: uploadId,
        documentId: uploadDocument._id
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Update document status to failed
    await Upload.findOneAndUpdate(
      { fileId: uploadId },
      { status: "failed", error: error.message }
    );
    
    // Clean up on error
    try {
      if (await fs.pathExists(tempFilePath)) {
        await fs.remove(tempFilePath);
      }
      if (await fs.pathExists(optimizedTempPath)) {
        await fs.remove(optimizedTempPath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    // Send error response
    res.status(500).json({
      success: false,
      message: "Failed to process file",
      error: error.message
    });
  }
}

// Add a helper function to determine mime type from file extension
function getMimeType(fileExt) {
  const ext = fileExt.toLowerCase().replace('.', '');
  const mimeTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Add cleanup function for abandoned uploads
async function cleanupAbandonedUploads() {
  try {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    // Find expired sessions
    const expiredSessions = await store.collection.find({
      'session.uploads': { $exists: true },
      'expires': { $lt: new Date(now) }
    });

    for (const session of await expiredSessions.toArray()) {
      const uploads = session.session.uploads;
      
      // Clean up temporary files
      for (const uploadId in uploads) {
        try {
          await fs.unlink(uploads[uploadId].tempFilePath);
          
          // Update associated document status
          await Upload.findOneAndUpdate(
            { fileId: uploadId },
            { status: 'failed', error: 'Upload abandoned' }
          );
        } catch (err) {
          console.error(`Failed to cleanup upload ${uploadId}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('Failed to cleanup abandoned uploads:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupAbandonedUploads, 60 * 60 * 1000);

module.exports = exports; 