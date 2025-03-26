let acceptUploads = {
  allow: true,
  reason: "",
}

const allowUploads = (req, res, next) => {
  // If acceptUploads.allow is false, return a 403 error to prevent starting NEW file uploads
  // This only runs when you START uploading a file, if you already started it then you wont be affected
  if (!acceptUploads.allow) {
    return res.status(403).json({ 
      success: false,
      message: `Uploads are currently disabled`,
      errorMessage: acceptUploads.reason,
      error: acceptUploads
    });
  }

  next();
};

module.exports = { allowUploads, acceptUploads }