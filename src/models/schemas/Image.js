const mongoose = require('mongoose')
const calculateVoteCount = require('../../helpers/calculateVoteCount')
const Schema = mongoose.Schema

const imageSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  votes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: Boolean,
      required: true
    }
  }],
  voteCount: {
    type: Number,
    default: 0
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
  fileSize: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'images'
})

// Middleware to update voteCount when votes array is modified
imageSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)
  next()
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image