const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
const generateRouteId = require('../../helpers/generateRouteId')
/* -------------------------------------------------------------------------- */

const postSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: false,
    default: `Untitled ${Date.now()}`
  },
  description: {
    type: String,
    required: false
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  privacy: {
    type: String,
    // TODO: This will later change to allow levels of friends to see
    enum: ['Public', 'Private', 'Unlisted'],
    default: 'Private',
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video'
  }],
  images: [{
    type: Schema.Types.ObjectId,
    ref: 'Image'
  }],
  audios: [{
    type: Schema.Types.ObjectId,
    ref: 'Audio'
  }],
  tags: [{
    type: String // TODO: change this to an enum once tags are added
  }],
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
  postId: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'posts'
})

// Middleware to update voteCount when likes array is modified
postSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)
  if (this.isNew) {
    this.postId = generateRouteId()
  }
  next()
})

// Define the Post model
const Post = mongoose.model('Post', postSchema)

// Export the Post model
module.exports = Post