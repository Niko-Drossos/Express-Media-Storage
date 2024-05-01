const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
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
    // This is stored as a markdown string
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
  // TODO: Add journal entry's
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
  }
}, {
  timestamps: true,
  collection: 'posts'
})

// Middleware to update voteCount when likes array is modified
postSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)

  next()
})

// Define the Post model
const Post = mongoose.model('Post', postSchema)

// Export the Post model
module.exports = Post