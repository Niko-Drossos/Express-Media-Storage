const ffmpeg = require('fluent-ffmpeg')
const stream = require('stream')

module.exports = function getVideoDetails(file) {
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const bufferStream = new stream.PassThrough()
    bufferStream.end(file.buffer)

    // Use ffprobe to get the video details directly from the buffer stream
    ffmpeg.ffprobe(bufferStream, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      resolve(metadata)
    })
  })
}
