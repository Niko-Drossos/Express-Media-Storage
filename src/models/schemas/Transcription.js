const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transcriptionSchema = new Schema({
  status: {
    type: String,
    enum: ['none', 'queued', 'complete'],
    default: 'none',
  },
  text: {
    type: String,
    default: '',
    required: false
  }
}, {
  timestamps: true,
  collection: 'transcriptions'
})

const Transcription = mongoose.model('Transcription', transcriptionSchema)

module.exports = Transcription