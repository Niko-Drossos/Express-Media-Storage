// This file will contain all the routes related to transcription.
// This includes creating a transcription, getting a transcription, updating a transcription, and deleting a transcription.
// These routes will also be used for returning a .vtt file of the transcription for use in subtitles.
const { Whisper } = require("smart-whisper")
const { decode } = require("node-wav")
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
const convertTo16BitWav = require("../helpers/convertTo16BitWav")
/* -------------------------------------------------------------------------- */

function read_wav(file) {
	const { sampleRate, channelData } = decode(fs.readFileSync(file));

	if (sampleRate !== 16000) {
		throw new Error(`Invalid sample rate: ${sampleRate}`);
	}
	if (channelData.length !== 1) {
		throw new Error(`Invalid channel count: ${channelData.length}`);
	}

	return channelData[0];
}

/* ------------------- Format milliseconds to HH:MM:SS.MMM ------------------ */

function formatMilliseconds(ms) {
  // Calculate hours, minutes, seconds, and milliseconds
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  // Pad hours, minutes, and seconds with leading zeros if necessary
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(3, '0');

  // Combine into final formatted string
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}

/* ---------------- Actually create a transcription document ---------------- */

async function createTranscription(document, transcriptionDocument, mimetype) {
  try {
    console.log(document)
    // Create a temporary file for the data so you can transcribe it 
    const tempFile = await createTempFile(document.fileId, mimetype)
    console.log('Ready for transcription:', tempFile);

    // Convert the file to a format that whisper can understand
    const wavFilePath = await convertTo16BitWav(tempFile)
    
    // Read the wav file
    
    // Create the whisper object to transcribe the file
    const whisper = new Whisper(whisper_modelName, { threads: 8 });

    // Options for whisper model
    const options = {
      n_threads: 24,       
      language: 'en',
    }

    const pcm = read_wav(wavFilePath)

    let transcription = await whisper.transcribe(pcm, options)

    let textArray = []
    transcription
      .on('transcribed', (result) => {
        result.from = formatMilliseconds(result.from)
        result.to = formatMilliseconds(result.to)
        textArray.push(result)
      })
      .on('finish', async () => {
        console.log(`Finished transcription for document: ${document._id} at ${Date.now()}`);
        // Save the result to the database
        transcriptionDocument.text = textArray
        transcriptionDocument.status = "complete"
        await transcriptionDocument.save()
      })

    // Delete the temporary files
    fs.unlinkSync(tempFile)
    fs.unlinkSync(wavFilePath)
  } catch (error) {
    console.error('An error occurred:', error);

    /* console.log(transcriptionDocument)
    // Delete the temporary files if it failed to do so
    fs.unlinkSync(tempFile)
    fs.unlinkSync(wavFilePath) */
    throw error;
  }
}

/* --------------------- Start the transcription process -------------------- */

generate = async (req, res) => {
  try {
    const { mimetype, documentId } = req.params

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

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
        errorMessage: `${mimetype} Document not found, document id is invalid`,
        error: {}
      })
    }

    // ! UNCOMMENT FOR PRODUCTION
    // Prevent overwriting a transcription
    /* if (document.transcription) {
      return res.status(400).json({
        success: false,
        message: "File has already been transcribed",
        errorMessage: "File has already been transcribed, if you wish to update it, call the update endpoint instead",
        error: {}
      })
    } */
   
    // Create the transcription document and add it to the body
    const transcriptionDocument = await Transcription.create({ status: "queued" })    
    
    // Create the transcription in the background after the API returns
    createTranscription(document, transcriptionDocument, mimetype)

    // Add the transcription _id to the document BEFORE the transcription occurs so it can be updated later.
    document.transcription = transcriptionDocument._id
    await document.save()

    res.status(200).json({
      success: true,
      message: "Started to generate transcription",
      data: {
        document: document,
        transcriptionId: transcriptionDocument._id
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