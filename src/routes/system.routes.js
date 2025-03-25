const express = require("express")
const router = express.Router()

/* ------------------------------- Controllers ------------------------------ */
const systemController = require("../controllers/systemController")
/* ------------------------------- Middlewares ------------------------------ */
const authenticateUserJWT = require("../models/middleware/authenticateUserJWT")
router.all("/*", authenticateUserJWT)
/* -------------------------------------------------------------------------- */

/* -------- Allow an admin to stop new uploads for graceful shutdown -------- */

router.post("/stop-uploads", systemController.stopUploads)

router.post("/start-uploads", systemController.startUploads)

/* ----------------------- Fetch current upload status ---------------------- */

router.get("/upload-status", systemController.uploadStatus)

/* -------------------------------------------------------------------------- */

module.exports = router