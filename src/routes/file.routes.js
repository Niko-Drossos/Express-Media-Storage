const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const { upload } = require("../helpers/gridFsMethods")
const processUploads = require("../models/middleware/processUploads")
// Allow for up to 10 files to be uploaded at once
const uploadFields = []
for (let i = 0; i < 10; i++) {
  uploadFields.push({ name: `file${i}`, maxCount: 1 })
}

router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

// TODO: I might remove this, i don't see a point to it
// router.get("/get", fileController.findFiles)

// Might get deprecated in the future
router.post("/upload", /* upload.fields(uploadFields), processUploads, */ fileController.batchUpload)

// Chunked file uploading
router.post("/start-chunk-upload", fileController.startChunkUpload)
router.post("/chunked-upload", upload.single("chunk"), fileController.chunkedUpload)

router.post("/delete", fileController.deleteFiles)

module.exports = router