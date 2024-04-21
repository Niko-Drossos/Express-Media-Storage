module.exports = getFileExt = (fileUrl) => {
  const urlSegments = fileUrl.split(".")
  const fileExtension = urlSegments[urlSegments.length - 1]
  return fileExtension
} 