const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
const generateRouteId = require('../../helpers/generateRouteId')
/* -------------------------------------------------------------------------- */

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  folderId: {
    type: String,
  }
}, {
  timestamps: true,
  collection: 'users'
})

userSchema.pre('save', function(next) {
	this.voteCount = calculateVoteCount(this.votes)
  // Create a folderId if the document is new
  if (this.isNew) {
    this.folderId = generateRouteId()
  }
	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User