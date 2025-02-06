const express = require("express")
const router = express.Router()

/* ------------------------------- Controller ------------------------------- */
const transcriptionController = require("../controllers/transcriptionController")
/* --------------------------------- Helpers -------------------------------- */

/* ------------------------------- Middlewares ------------------------------ */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.post("/generate/:mimetype/:documentId", transcriptionController.generate)

// Returns just the text of the transcription as a VTT file
router.get("/subtitles/:transcriptionId", transcriptionController.getSubtitles)

router.get("/:transcriptionId", transcriptionController.getById)

module.exports = router