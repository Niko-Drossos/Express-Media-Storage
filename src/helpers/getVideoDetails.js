const ffmpeg = require('fluent-ffmpeg')

module.exports = getVideoDetails = async (filePath) => {
  return ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
      throw new Error(err.message);
    }
    // const duration = metadata.format.duration;
    console.log(metadata.format)
    return metadata.format.duration
  });
}