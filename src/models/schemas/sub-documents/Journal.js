const journalSchema = {
  time: {
    type: String,
    required: true
  },
  entry: {
    type: String,
    required: true
  }
}

module.exports = journalSchema
