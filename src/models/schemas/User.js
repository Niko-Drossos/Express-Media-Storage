const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

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
  // TODO: Not yet in use
  profilePhoto: {
    type: Schema.Types.ObjectId,
    required: false
  },
  tags: {
    type: [String],
    default: []
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    select: false
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    select: false
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    select: false
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
    select: false
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