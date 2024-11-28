const ffmpeg = require('fluent-ffmpeg')
const stream = require('stream')

module.exports = function getFileDetails(file) {
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    /* const bufferStream = new stream.PassThrough()
    bufferStream.end(file.buffer) */
    const bufferStream = file

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

/* module.exports = async function getFileDetails(filePath) {
  try {
    const ffprobe = await ffmpeg(filePath).ffprobe((err, metadata) => {
      if (err) {
        throw err;
      }
      console.log(metadata);
    });

    return new Promise((resolve, reject) => {
      ffprobe.on('end', () => {
        resolve(metadata);
      });
      ffprobe.on('error', (err) => {
        reject(err);
      });
    })
  } catch (error) {
    console.error('Caught an error:', error.message);
  }
}
 */