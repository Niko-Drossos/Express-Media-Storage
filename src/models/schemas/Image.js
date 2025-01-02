const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')

/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
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
  description: {
    type: String,
    default: '',
    required: false
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
  votes: [{
    type: Vote,
    select: false
  }],
  voteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'images'
})

/* --------------------------------- Indexes -------------------------------- */

imageSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

imageSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image