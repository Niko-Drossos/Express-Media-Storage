const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const fileController = require("../controllers/fileController")
/* ------------------------------- Middleware ------------------------------- */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
const { upload } = require("../helpers/gridFsMethods")
const processUploads = require("../models/middleware/processUploads")

router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

router.get("/get", fileController.findFiles)

router.post("/upload", upload.array('files'), processUploads, fileController.batchUpload)

router.post("/delete", fileController.deleteFiles)

module.exports = router