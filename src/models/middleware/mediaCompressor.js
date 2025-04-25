const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function mediaCompressor(file) {
  return new Promise((resolve, reject) => {
    // Determine output file extension based on mimetype
    let outputFileExt;
    let command = ffmpeg();

    if (file.mimetype.startsWith('video/')) {
      outputFileExt = '.mp4';
      command = command.videoCodec('libx264').audioCodec('aac');

    } else if (file.mimetype.startsWith('image/')) {
      outputFileExt = '.png';
      command = command.size('?x720').outputOptions('-vf scale=-1:720');

    } else if (file.mimetype.startsWith('audio/')) {
      outputFileExt = '.mp3';
      command = command.audioCodec('libmp3lame');

    } else {
      return reject(new Error('Unsupported file type'));
    }

    const illegalCharsRegex = /[<>:"\/\\|?*\x00-\x1F]/g; 
    // Remove spaces and illegal characters from filename
    const sanitizedPath = file.originalname.replace(/ /g, '_').replace(illegalCharsRegex, '_'); 

    // Temporary file path to store uploaded file
    const tempFilePath = path.join(os.tmpdir(), `tempfile_${sanitizedPath}`);
    
    // Write uploaded file buffer to temporary file
    fs.writeFile(tempFilePath, file.buffer, async (err) => {
      if (err) {
        console.error('Error writing file to temp:', err);
        return reject(err);
      }

      // Run ffmpeg command
      command.input(tempFilePath)
        .outputOptions('-preset veryfast') // Example option for faster encoding
        .on('error', (err) => {
          console.error('FFmpeg Error:', err);
          reject(err);
        })
        .on('end', () => {
          console.log('Compression finished');
          // Read compressed file back into buffer
          fs.readFile(`${tempFilePath}.compressed`, (err, data) => {
            if (err) {
              console.error('Error reading compressed file:', err);
              return reject(err);
            }
            resolve({
              ...file,
              buffer: data,
              size: data.length,
            });
            // Optionally, delete temporary files
            fs.unlinkSync(`${tempFilePath}.compressed`);
          });
        })
        .save(`${tempFilePath}.compressed`); // Save compressed file with a temporary extension
    });
  });
}

module.exports = mediaCompressor;
