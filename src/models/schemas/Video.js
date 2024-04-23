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
  title: {
    type: String,
    required: false
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
    type: String, // TODO: This will probably be a base 64 string
    required: false //Change later
  },
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
    type: String
  }
}, {
  timestamps: true,
  collection: 'videos'
})

// Middleware to update likeCount when votes array is modified
videoSchema.pre('save', function(next) {
  // Get the date in the format MM-DD-YYYY instead of MM/DD/YYYY
  const dateString = this.date.toLocaleDateString().replace(/(\d+)\/(\d+)\/(\d+)/, "$1-$2-$3");

  // const hostServer = "http://localhost:3000" Possibly add this functionality in the future

  this.likeCount = calculateVoteCount(this.votes)
  if (this.isNew) {
    this.fileId = generateRouteId()
  }

  if (!this.title) {
    this.title ?? dateString + '-Untitled'
  }

  if (!this.url) {
    this.url = path.join(dateString, this.fileId + '.mp4')
  }
  next()
})

const Video = mongoose.model('Video', videoSchema)

module.exports = Video