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
})

module.exports = transcriptionSchema