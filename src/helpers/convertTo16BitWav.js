// Convert a file to 16-bit WAV using FFmpeg for audio transcription
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');

async function convertTo16BitWav(inputFilePath) {
  return new Promise((resolve, reject) => {
    // Define the output file path in the same directory
    const outputFilePath = path.join(
      os.tmpdir(),
      `transcription/${path.basename(inputFilePath, path.extname(inputFilePath))}_converted.wav`
    );

    // File location of the noise reduction filter recurrent neural network for FFmpeg
    const noiseReductionFileLocation = path.join(path.dirname(path.dirname(__dirname)), "cb.rnnn");

    // Run FFmpeg with fluent-ffmpeg
    ffmpeg(inputFilePath)
      .audioFrequency(16000) // Set audio sampling rate to 16 kHz
      .audioChannels(1) // Convert to mono
      .audioCodec('pcm_s16le') // Encode as 16-bit PCM WAV
      .audioFilters([
        `highpass=f=300`,
        `lowpass=f=3000`,
        `afftdn=nf=-25`,
        `arnndn=m=${noiseReductionFileLocation}`
      ])
      .on('start', (commandLine) => {
        console.log(`Running FFmpeg: ${commandLine}`);
      })
      .on('stderr', (stderrLine) => {
        console.error(`FFmpeg Error: ${stderrLine}`);
      })
      .on('end', () => {
        console.log(`Conversion complete: ${outputFilePath}`);
        resolve(outputFilePath);
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .save(outputFilePath);
  });
}

module.exports = convertTo16BitWav