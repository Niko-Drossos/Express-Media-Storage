const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const transcriptionController = require("../controllers/transcriptionController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/video/:videoId", transcriptionController.requestVideoTranscription)

// router.post("/audio/:filename", transcriptionController.requestAudioTranscription)

/* ------------------ Patch the transcription into MongoDB ------------------ */

/* router.patch("/video/:filename", transcriptionController.patchVideoTranscription)

router.patch("/audio/:filename", transcriptionController.patchAudioTranscription) */

module.exports = router