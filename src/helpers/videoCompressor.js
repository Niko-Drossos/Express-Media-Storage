const ffmpeg = require('fluent-ffmpeg');

// Function to compress a video
async function videoCompressor(inputBuffer) {
  return new Promise((resolve, reject) => {
    // Create FFmpeg command
    const command = ffmpeg()
      .input(inputBuffer) // Input from buffer
      .videoCodec('libx264') // Set video codec
      .audioCodec('aac')     // Set audio codec
      .outputOptions('-preset veryfast') // Set encoding preset for faster compression
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Compression complete');
        resolve(outputBuffer);
      });

    // Output to buffer
    const outputBuffer = Buffer.from([]);
    command.outputFormat('mp4').on('data', (chunk) => {
      outputBuffer = Buffer.concat([outputBuffer, chunk]);
    });

    // Run FFmpeg command
    command.run();
  });
}

module.exports = videoCompressor;
