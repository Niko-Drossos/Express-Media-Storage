const ErrorLog = require("../../schemas/ErrorLog") // Adjust the path if needed

// Automatically created error logs by passing in the req and error
async function logError(req, error) {
  try {
    const logEntry = {
      level: "error",
      message: error.message || "Unknown error occurred",
      service: "Story-api", // Modify based on your app module
      user: {
        userId: req.userId,
        username: req.username
      }, 
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.headers["x-forwarded-for"] || "Unknown",
        headers: {
          "user-agent": req.headers["user-agent"],
          "content-length": req.headers["content-length"]
        }
      },
      error: error
    }

    await ErrorLog.create(logEntry)
    console.error("Logged error:", logEntry)
  } catch (err) {
    console.error("Failed to log error to MongoDB:", err)
  }
}

module.exports = logError