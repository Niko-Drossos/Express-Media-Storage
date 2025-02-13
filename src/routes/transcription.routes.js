const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const transcriptionController = require("../controllers/transcriptionController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */


// Generate a new transcription
router.post("/generate/:mimetype/:documentId", transcriptionController.generate)

// Returns just the text of the transcription as a VTT file
router.get("/subtitles/:transcriptionId", transcriptionController.getSubtitles)

// Fetch a specific transcription
router.get("/:transcriptionId", transcriptionController.getById)

// Suggest a transcription edit
// router.post("/suggest", transcriptionController.suggest)

// accept a suggestion
// router.post("/accept/:suggestionId", transcriptionController.accept)

module.exports = router