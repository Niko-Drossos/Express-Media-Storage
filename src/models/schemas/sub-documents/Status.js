const statusSchema = {
  type: String,
  enum: ['uploading', 'completed', 'deleted'],
  default: 'uploading',
  required: true
}

module.exports = statusSchema