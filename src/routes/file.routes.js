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

router.get("/get", fileController.findFiles)

router.post("/upload", upload.fields(uploadFields), processUploads, fileController.batchUpload)

router.post("/delete", fileController.deleteFiles)

module.exports = router