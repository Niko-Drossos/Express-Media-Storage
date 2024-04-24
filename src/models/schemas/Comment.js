const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  originType: {
    type: String,
    enum: ['Post', 'Comment', 'User', 'Video', 'Image', 'Audio'],
    required: true
  },
  originId: {
    type: Schema.Types.ObjectId,
    refPath: 'originType',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  collection: 'comments'
})

// Middleware to update voteCount when votes array is modified
commentSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)
  next()
})

commentSchema.path('originId').validate(function(value) {
  // Validate that the originType and originId combination is valid
  const modelNames = ['Post', 'Comment', 'User', 'Video', 'Image', 'Audio'];
  return modelNames.includes(this.originType) && value != null;
}, 'Invalid combination of originType and originId');

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment