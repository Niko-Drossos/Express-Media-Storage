const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* ------------------------------ Sub-Documents ----------------------------- */
const Vote = require('./sub-documents/Vote')
const Status = require('./sub-documents/Status')
const Privacy = require('./sub-documents/Privacy')
/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const uploadSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  date: {
    type: Date,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: '',
    required: false
  },
  filename: {
    type: String,
    required: true,
  },
  fileId: {
    type: String,
    required: true,
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
  dimensions: {
    width: {
      type: Number,
      required: false
    },
    height: {
      type: Number,
      required: false
    },
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
  collection: 'uploads'
})

/* --------------------------------- Indexes -------------------------------- */

uploadSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

uploadSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Upload = mongoose.model('Upload', uploadSchema)

module.exports = Upload