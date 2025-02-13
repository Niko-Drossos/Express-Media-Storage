 //! NOT YET IMPLEMENTED
// TODO: Create a media compressor to compress videos, audio and image chunks as there are uploaded
/*
const ffmpeg = require('fluent-ffmpeg');
// const sharp = require('sharp');
const { PassThrough } = require('stream');

const fileProcessors = {
  video: ['mp4', 'mkv', 'mov', 'avi'],
  audio: ['mp3', 'wav', 'aac', 'flac'],
  image: ['jpg', 'jpeg', 'png', 'webp'],
};

const processFile = async (buffer, fileType) => {
  if (fileProcessors.video.includes(fileType)) return compressVideo(buffer);
  if (fileProcessors.audio.includes(fileType)) return compressAudio(buffer);
  if (fileProcessors.image.includes(fileType)) return compressImage(buffer, fileType);
  throw new Error('Unsupported file type');
};

// Middleware for compressing media

const compressMedia = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');
    console.log(`Starting compression for file: ${req.body.fileExt}`);
    req.file.buffer = await processFile(req.file.buffer, req.body.fileExt);
    next();
  } catch (err) {
    console.error('Compression error:', err.message);
    res.status(500).send('Compression error');
  }
};

// Video compression using FFmpeg
const compressVideo = async (buffer) => {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(buffer);
    console.log("Starting video compression...")
    const chunks = [];
    const outputStream = new PassThrough();

    ffmpeg(inputStream)
      .outputOptions([
        '-c:v libx264', // H.264 codec
        '-preset ultrafast', // Fast processing
        '-crf 23', // Compression level (lower is higher quality)
        '-c:a copy', // Keep audio unchanged
      ])
      .format('mp4')
      .on('error', (err) => reject(err))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream);

    outputStream.on('data', (chunk) => chunks.push(chunk));
  });
}

// Audio compression using FFmpeg
const compressAudio = async (buffer) => {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(buffer);

    const chunks = [];
    const outputStream = new PassThrough();

    ffmpeg(inputStream)
      .outputOptions([
        '-c:a aac', // AAC codec
        '-b:a 128k', // Bitrate: 128kbps
      ])
      .format('mp3')
      .on('error', (err) => reject(err))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outputStream);

    outputStream.on('data', (chunk) => chunks.push(chunk));
  });
}

// Image compression using Sharp
const compressImage = async (buffer, fileType) => {
  let pipeline = sharp(buffer);

  if (fileType === 'jpeg' || fileType === 'jpg') {
    pipeline = pipeline.jpeg({ quality: 80 });
  } else if (fileType === 'png') {
    pipeline = pipeline.png({ quality: 80 });
  } else if (fileType === 'webp') {
    pipeline = pipeline.webp({ quality: 80 });
  }

  return pipeline.toBuffer();
}

module.exports = compressMedia */