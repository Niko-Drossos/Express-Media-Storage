const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

// TODO: Add profile image field

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
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
  collection: 'users'
})

userSchema.pre('save', function(next) {
	this.voteCount = calculateVoteCount(this.votes)

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User