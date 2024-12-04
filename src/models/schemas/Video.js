const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')
const Transcription = require('./sub-documents/Transcription')

/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const videoSchema = new Schema({
  user: SubUser,
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
    default: '(No Description)',
    required: false
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  transcription: Transcription,
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
    }
  },
  length: {
    type: Number,
    // TODO: uncomment these after testing
    required: false 
  },
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
  collection: 'videos'
})

// Middleware to update likeCount when votes array is modified
videoSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Video = mongoose.model('Video', videoSchema)

module.exports = Video