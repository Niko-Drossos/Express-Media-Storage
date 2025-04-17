const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* ------------------------------ Sub-Documents ----------------------------- */
const Vote = require('./sub-documents/Vote')
const Status = require('./sub-documents/Status')
const Privacy = require('./sub-documents/Privacy')
/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const audioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    default: '',
    required: false
  },
  filename: {
    type: String,
    required: true,
    // unique: true
  },
  fileId: {
    type: String,
    required: true,
    // unique: true
  },
  status: Status,
  transcription: {
    type: Schema.Types.ObjectId,
    ref: 'Transcription'
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  tags: [{
    type: String 
  }],
  privacy: Privacy,
  /* length: {
    type: Number,
    // TODO: uncomment these after testing
    required: false 
  }, */
  fileSize: {
    type: String,
    required: false
  },
  votes: [{
    type: Vote,
    select: false
  }],
  voteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'audios'
})

/* --------------------------------- Indexes -------------------------------- */

audioSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

// Update likeCount when votes array is modified
audioSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Audio = mongoose.model('Audio', audioSchema)

module.exports = Audio