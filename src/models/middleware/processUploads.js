const mediaCompressor = require('./mediaCompressor')
const getFileDetails = require('../../helpers/getFileDetails')
const fs = require('fs-extra')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

const generateThumbnail = async (fileBuffer) => {
  const tempDir = path.join(__dirname, 'temp');
  const tempFilePath = path.join(tempDir, `${Date.now()}-temp-thumbnail.mp4`);
  
  // Ensure the temp directory exists
  await fs.mkdir(tempDir, { recursive: true });

  // Write the buffer to a temporary file
  await fs.writeFile(tempFilePath, fileBuffer);

  return new Promise((resolve, reject) => {
    const buffer = [];
    const passThroughStream = new PassThrough();

    ffmpeg(tempFilePath)
      .inputFormat('mp4') // Ensure format is correctly specified
      .on('end', async () => {
        try {
          const thumbnailBuffer = Buffer.concat(buffer);
          const base64Thumbnail = thumbnailBuffer.toString('base64');
          await fs.unlink(tempFilePath); // Clean up the temp file if it exists
          resolve(base64Thumbnail);
        } catch (err) {
          console.error('Error during cleanup:', err);
          reject(err);
        }
      })
      .on('error', async (err) => {
        console.error('ffmpeg error:', err);
        try {
          // Try to delete the temp file if it exists
          await fs.unlink(tempFilePath);
        } catch (unlinkErr) {
          console.error('Error during file deletion:', unlinkErr);
        }
        reject(err);
      })
      .screenshots({
        timestamps: [1], // Capture a frame at 1 second
        size: '320x240', // Thumbnail dimensions
      })
      .pipe(passThroughStream);

    passThroughStream.on('data', (chunk) => buffer.push(chunk));
  });
};



const processUploads = async (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }
  
  // Store uploaded files in req.uploads array
  req.uploads = []
  for (let i = 0; i < 10; i++) {
    if (typeof req.files[`file${i}`] == "object") {
      const file = req.files[`file${i}`][0];
      const metadata = await getFileDetails(file)

      const { duration, coded_width, coded_height, codec_type } = metadata.streams[0]

      // Only add the dimensions if it's a video or image
      let dimensions
      if (codec_type !== "audio") {
        dimensions = { width: coded_width, height: coded_height }
      }

      //! FIX THUMBNAILS 
      // Generate thumbnail
      let thumbnail = null;
      /* if (codec_type === 'video') {
        try {
          thumbnail = await generateThumbnail(file.buffer);
        } catch (err) {
          console.error(`Error generating thumbnail for video ${file.originalname}:`, err);
        }
      } */

      // ! Replace when media compressor works
      // const compressedFile = await mediaCompressor(file, )
      // console.log(`Compressed file`)
      // console.log(compressedFile)
      req.uploads.push({
        // ! Replace when media compressor works
        // ...compressedFile,
        ...file,

        // Naw what da hell goofy ahh script 💀
        ...(dimensions !== undefined && { dimensions: dimensions }),
        ...(duration !== "N/A" && { duration: duration }),
        ...(thumbnail && { thumbnail })
      })
    }
  }

  next()
}

module.exports = processUploads