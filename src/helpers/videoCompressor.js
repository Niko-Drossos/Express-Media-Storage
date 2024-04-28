const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Function to compress a video
function videoCompressor(inputPath, outputPath) {
  // Create FFmpeg command
  const command = ffmpeg(inputPath)
    .videoCodec('libx264') // Set video codec
    .audioCodec('aac')     // Set audio codec
    .outputOptions('-preset veryfast') // Set encoding preset for faster compression
    .on('error', (err) => {
      console.error('Error:', err);
    })
    .on('end', () => {
      console.log('Compression complete');
    });

  // Create output stream
  const outputStream = command.pipe(fs.createWriteStream(outputPath));

  return outputStream;
}

module.exports = videoCompressor;
