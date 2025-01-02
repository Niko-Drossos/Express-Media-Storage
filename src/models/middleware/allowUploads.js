let acceptUploads = {
  allow: true,
  reason: "",
}

const allowUploads = (req, res, next) => {
  // If acceptUploads.allow is false, return a 403 error to prevent starting NEW file uploads
  if (!acceptUploads.allow) {
    return res.status(403).json({ 
      success: false,
      message: `Uploads are currently disabled. Reason: ${acceptUploads.reason}`,
      errorMessage: 'Uploads are currently disabled.',
      error: acceptUploads
    });
  }

  next();
};

module.exports = { allowUploads, acceptUploads }