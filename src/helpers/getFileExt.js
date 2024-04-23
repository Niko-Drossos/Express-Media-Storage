module.exports = getFileExt = (fileUrl) => {
  return fileUrl.split('.').pop().toLowerCase()
} 