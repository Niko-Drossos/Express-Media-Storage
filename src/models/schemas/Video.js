const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
const generateRouteId = require('../../helpers/generateRouteId')
/* -------------------------------------------------------------------------- */

const videoSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // An absolute path to the video file
  url: {
    type: String,
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  thumbnailImage: {
    type: String // TODO: This will probably be a base 64 string
  },
  tags: [{
    type: String // TODO: change this to an enum once tags are added
  }],
  privacy: {
    type: String,
    enum: ['Public', 'Private', 'Unlisted'],
    default: 'Public',
    required: true
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  length: {
    type: Number,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  votes: [{
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
  voteCount: {
    type: Number,
    default: 0
  },
  fileId: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'videos'
})

// Middleware to update likeCount when votes array is modified
videoSchema.pre('save', function(next) {
  this.likeCount = calculateVoteCount(this.votes)
  if (this.isNew) {
    this.fileId = generateRouteId()
  }
  next()
})

const Video = mongoose.model('Video', videoSchema)

module.exports = Video