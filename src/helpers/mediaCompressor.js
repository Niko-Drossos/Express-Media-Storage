const ffmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')

// ! Not yet functionally implemented
// Function to compress a media file (video or audio)
async function mediaCompressor(file) {
  console.log(file.buffer)
  return new Promise((resolve, reject) => {
    // Create FFmpeg command
    const command = ffmpeg()
      .input(new PassThrough().end(file.buffer)) // Input from buffer
      .outputOptions('-preset veryfast') // Set encoding preset for faster compression

    if (file.mimetype.startsWith('video/')) {
      command.videoCodec('libx264').audioCodec('aac') // Set codecs for video

    } else if (file.mimetype.startsWith('image/')) {
      command.size('?x720').outputOptions('-vf scale=-1:720').videoCodec('libx264') // For images, we resize and compress

    } else if (file.mimetype.startsWith('audio/')) {
      command.audioCodec('aac') // Set codec for audio only

    } else {
      reject(new Error('Unsupported file type'))
    }

    // Prepare output stream to collect the compressed data
    const outputStream = new PassThrough()
    const chunks = []

    outputStream.on('data', (chunk) => chunks.push(chunk))
    outputStream.on('end', () => {
      const compressedBuffer = Buffer.concat(chunks);
      resolve({
        ...file,
        buffer: compressedBuffer,
        size: compressedBuffer.length,
      });
    })

    command.on('error', (err) => {
      console.error('FFmpeg Error:', err);
      reject(err)
    })

    command.pipe(outputStream, { end: true })
    command.run()
  })
}

module.exports = mediaCompressor
