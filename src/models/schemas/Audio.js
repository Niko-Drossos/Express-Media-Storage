const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

const audioSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: false
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  tags: [{
    type: String // TODO: change this to an enum once tags are added
  }],
  privacy: {
    type: String,
    // This will later change to allow levels of friends to see
    enum: ['Public', 'Private', 'Unlisted'],
    default: 'Private',
    required: true
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
  votes: {
    type: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      vote: {
        type: Boolean,
        required: true
      }
    }],
    select: false
  },
  voteCount: {
    type: Number,
    default: 0
  },
  fileId: {
    type: String,
    required: true,
    unique: true
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

const Video = mongoose.model('Audio', audioSchema)

module.exports = Video