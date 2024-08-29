const getVideoDetails = require("../../helpers/getVideoDetails")
const mediaCompressor = require('../../helpers/mediaCompressor')


const processUploads = async (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' })
  }
  
  // Store uploaded files in req.uploads array
  req.uploads = []
  for (let i = 0; i < 10; i++) {
    if (typeof req.files[`file${i}`] == "object") {
      const metadata = await getVideoDetails(req.files[`file${i}`][0])

      const { duration, coded_width, coded_height, codec_type } = metadata.streams[0]

      // Only add the dimensions if it's a video or image
      let dimensions
      if (codec_type !== "audio") {
        dimensions = { width: coded_width, height: coded_height }
      }

      // ! Replace when media compressor works
      // const compressedFile = await mediaCompressor(req.files[`file${i}`][0], )
      // console.log(`Compressed file`)
      // console.log(compressedFile)
      req.uploads.push({
        // ! Replace when media compressor works
        // ...compressedFile,
        ...req.files[`file${i}`][0],

        // Naw what da hell goofy ahh script 💀
        ...(dimensions !== undefined && { dimensions: dimensions }),
        ...(duration !== "N/A" && { duration: duration }),
      })
    }
  }

  next()
}

module.exports = processUploads