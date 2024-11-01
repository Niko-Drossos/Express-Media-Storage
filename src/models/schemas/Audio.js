const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')
const Transcription = require('./sub-documents/Transcription')

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

const audioSchema = new Schema({
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
  collection: 'audios'
})

// Middleware to update likeCount when votes array is modified
audioSchema.pre('save', function(next) {
  // Get the date in the format MM-DD-YYYY instead of MM/DD/YYYY
  const dateString = this.date.toLocaleDateString().replace(/(\d+)\/(\d+)\/(\d+)/, "$1-$2-$3");

  this.likeCount = calculateVoteCount(this.votes)
  if (!this.title) {
    this.title ?? dateString + '-Untitled'
  }

  next()
})

const Audio = mongoose.model('Audio', audioSchema)

module.exports = Audio