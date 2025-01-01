const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const { upload } = require("../helpers/gridFsMethods")
// const compressMedia = require("../models/middleware/processFileChunk")

router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// TODO: I might remove this, i don't see a point to it
// router.get("/get", fileController.findFiles)

// Chunked file uploading
router.post("/start-chunk-upload", fileController.startChunkUpload)

// TODO: Fix compression middleware to accept file chunks and use it when ready
router.post("/chunked-upload", upload.single("chunk"), /* compressMedia, */ fileController.chunkedUpload)

router.post("/delete", fileController.deleteFiles)

module.exports = router