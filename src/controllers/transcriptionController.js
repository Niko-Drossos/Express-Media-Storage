// This file will contain all the routes related to transcription.
// This includes creating a transcription, getting a transcription, updating a transcription, and deleting a transcription.
// These routes will also be used for returning a .vtt file of the transcription for use in subtitles.
const whisper = require("whisper-node").default
const path = require("path")
const spawn = require('child_process').spawn
const os = require("os")
const fs = require("fs-extra")
const dotenv = require("dotenv")

dotenv.config()

const { whisper_modelName } = process.env
/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Image = require("../models/schemas/Image")
const Video = require("../models/schemas/Video")
const Audio = require("../models/schemas/Audio")
const Transcription = require("../models/schemas/Transcription")
/* --------------------------------- Helpers -------------------------------- */
const { createTempFile } = require("../helpers/gridFsMethods")
/* -------------------------------------------------------------------------- */

// This function creates a tmp file from GridFS, stores it in the os.tmpdir(), and returns its path
async function processFile(document) {
  try {
    const tempFilePath = await createTempFile(document.fileId, document.mimetype);
    
    console.log(`File saved to temporary path: ${tempFilePath}`);
    
    // You can now process the file at tempFilePath
    return tempFilePath;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}


async function convertTo16BitWav(inputFilePath) {
  return new Promise((resolve, reject) => {
    // Define the output file path in the same directory
    const outputFilePath = path.join(os.tmpdir(), `transcription/${path.basename(inputFilePath, path.extname(inputFilePath))}_converted.wav`);

    // This is the file location of the noise reduction filter recurrent neural network for FFmpeg.
    // Source code for this can be found here:
    // https://github.com/richardpl/arnndn-models/blob/master/cb.rnnn 
    noiseReductionFileLocation = path.join(path.dirname(path.dirname(__dirname)), "cb.rnnn")

    // Ensure FFmpeg command is correct
    const ffmpegArgs = [
      '-i', inputFilePath,   // Input file
      '-ar', '16000',        // Set audio sampling rate to 16 kHz
      '-ac', '1',            // Set number of audio channels to mono
      '-c:a', 'pcm_s16le',   // Encode as 16-bit PCM WAV
      // '-af', 'highpass=f=300, lowpass=f=3000, afftdn=nf=-25', // Audio filters to boost voice quality
      '-af', `highpass=f=300, lowpass=f=3000, afftdn=nf=-25, arnndn=m=${noiseReductionFileLocation}`, // Advanced noise reduction
      // '-af', `arnndn=m=${noiseReductionFileLocation}`, // Advanced noise reduction
      '-loglevel','verbose',
      outputFilePath         // Output file
    ];

    console.log(`Running FFmpeg: ffmpeg ${ffmpegArgs.join(' ')}`);

    // Spawn the FFmpeg process
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    // Capture FFmpeg errors
    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg Error: ${data.toString()}`);
    });

    // Handle process exit
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`Conversion complete: ${outputFilePath}`);
        resolve(outputFilePath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

/* -------------------- Generate transcriptions for files ------------------- */

generate = async (req, res) => {
  try {
    const { documentId, mimetype } = req.params

    // Find the document to get the metadata
    let document
    switch (mimetype) {
      case "video":
        document = await Video.findById(documentId)
        break
      case "audio":
        document = await Audio.findById(documentId)
        break
    }

    // ! UNCOMMENT
    // Throw error if file was already transcribed in the past
    /* if (document.transcription) {
      return res.status(400).json({
        success: false,
        message: "File has already been transcribed"
      })
    } */

    // Create the transcription document and add it to the body
    const createdDocument = await Transcription.create({ status: "queued" })    

    // Add the transcription _id to the document BEFORE the transcription occurs so it can be updated later.
    document.transcription = createdDocument._id
    await document.save()

    // Create a temporary file for the data so you can transcribe it 
    const tempFile = await processFile({ fileId: document.fileId, mimetype });
    console.log('Ready for transcription:', tempFile);

    // Convert the file to a format that whisper can understand
    const wavFilePath = await convertTo16BitWav(tempFile)
      
    // Options for whisper model
    const options = {
      modelName: whisper_modelName,       
      whisperOptions: {
        language: 'auto',         
        gen_file_vtt: true,     
        // max_initial_silence: 0, 
        no_fallback: true,
        verbose: true
      }
    }

    console.log(whisper)

    // Transcribe the file
    const transcription = await whisper(wavFilePath, options);
    
    createdDocument.text = transcription
    createdDocument.status = "complete"
    await createdDocument.save()

    // Delete the temporary files
    fs.unlinkSync(tempFile)
    fs.unlinkSync(wavFilePath)

    res.status(200).json({
      success: true,
      message: "Generated transcription",
      data: {
        transcription
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate transcription",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------- Request a transcription by its _id ------------------- */

getById = async (req, res) => {
  try {
    const { transcriptionId } = req.params

    const transcription = await Transcription.findById(transcriptionId)

    res.status(200).json({
      success: true,
      message: "Retrieved transcription",
      data: {
        transcription
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/* -------------- Request a transcription for subtitle purposes ------------- */

getSubtitles = async (req, res) => {
  try {
    const { transcriptionId } = req.params

    const transcription = await Transcription.findById(transcriptionId)

    // Parse the array as a vtt file
    let vtt = "WEBVTT\n\n"

    for (let i = 0; i < transcription.text.length; i++) {
      const { start, end, speech } = transcription.text[i]
      vtt += `${start} --> ${end}\n${speech}\n\n`
    }

    // Set appropriate headers for the browser
    res.setHeader("Content-Type", "text/vtt")

    res.status(200).send(vtt)
  } catch (error) {
    res.status(500).send(error.message)
  }
}


module.exports = { generate, getById, getSubtitles }