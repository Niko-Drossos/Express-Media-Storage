const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')

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
  user: SubUser,
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  tags: [{
    type: String 
  }],
  privacy: Privacy,
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  votes: [Vote],
  voteCount: {
    type: Number,
    default: 0
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