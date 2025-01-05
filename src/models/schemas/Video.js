const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* ------------------------------ Sub-Documents ----------------------------- */
const Vote = require('./sub-documents/Vote')
const Status = require('./sub-documents/Status')
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
    default: '',
    required: false
  },
  filename: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  status: Status,
  transcription: Transcription,
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  tags: [{
    type: String 
  }],
  privacy: Privacy,
  // I don't knw if I can add this field, I need to use ffmpeg for this
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
  collection: 'videos'
})

/* --------------------------------- Indexes -------------------------------- */

videoSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

// Update likeCount when votes array is modified
videoSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Video = mongoose.model('Video', videoSchema)

module.exports = Video