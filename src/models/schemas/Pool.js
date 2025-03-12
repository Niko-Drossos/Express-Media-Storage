const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* ------------------------------ Sub-Documents ----------------------------- */
const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')
const Journal = require('./sub-documents/Journal')
/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const poolSchema = new Schema({
  user: SubUser,
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: new Date().toLocaleString(),
    required: false
  },
  description: {
    // This is stored as a markdown string
    type: String,
    default: '',
    required: false
  },
  privacy: Privacy,
  edited: {
    type: {
      isEdited: {
        type: Boolean,
      },
      date: {
        type: Date,
      }
    },
    default: {
      isEdited: false,
      date: Date.now()
    },
    _id: false
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    date: { 
      type: Date || null,
      default: null
    },
    _id: false
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
    type: String
  }],
  // I don't know why this is here, I might keep it though
  journal: {
    type: [Journal]
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
  collection: 'pools'
})

/* --------------------------------- Indexes -------------------------------- */

poolSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

// Middleware to update voteCount when likes array is modified
poolSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const Pool = mongoose.model('Pool', poolSchema)

module.exports = Pool