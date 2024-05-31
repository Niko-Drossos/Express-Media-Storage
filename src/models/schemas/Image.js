const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

const imageSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  votes: {
    type: [{
      user: {
        type: {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          username: {
            type: String,
            required: true
          }
        },
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
  fileId: {
    type: String,
    required: true,
    unique: true
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