const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const { upload } = require("../helpers/gridFsMethods")
// const compressMedia = require("../models/middleware/processFileChunk")

// TODO: Deprecate these middlewares
// Allow for up to 10 files to be uploaded at once
// const processUploads = require("../models/middleware/processUploads")
/* 
const uploadFields = []
for (let i = 0; i < 10; i++) {
  uploadFields.push({ name: `file${i}`, maxCount: 1 })
} */


router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// TODO: I might remove this, i don't see a point to it
// router.get("/get", fileController.findFiles)

// TODO: Deprecated in the future
// router.pool("/upload", /* upload.fields(uploadFields), processUploads, */ fileController.batchUpload)

// Chunked file uploading
router.pool("/start-chunk-upload", fileController.startChunkUpload)

// TODO: Fix compression middleware to accept file chunks and use it when ready
router.pool("/chunked-upload", upload.single("chunk"), /* compressMedia, */ fileController.chunkedUpload)

router.pool("/delete", fileController.deleteFiles)

module.exports = router