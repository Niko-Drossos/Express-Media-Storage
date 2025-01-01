module.exports = getFileExt = (fileName) => {
  return fileName.split('.').pop().toLowerCase()
} 