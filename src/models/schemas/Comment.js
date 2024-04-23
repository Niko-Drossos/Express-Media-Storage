const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

const commentSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  originType: {
    type: String,
    enum: ['Post', 'Comment', 'User', 'Video', 'Image', 'Audio'],
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
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
  }
}, {
  timestamps: true,
  collection: 'comments'
})

// Middleware to update voteCount when votes array is modified
commentSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)
  next()
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment