const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')

/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const postSchema = new Schema({
  user: SubUser,
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: false,
    default: new Date().toLocaleString()
  },
  description: {
    // This is stored as a markdown string
    type: String,
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
  journal: {
    type: [{
      time: {
        type: String,
        required: true
      },
      entry: {
        type: String,
        required: true
      }
    }]
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
  collection: 'posts'
})

// Middleware to update voteCount when likes array is modified
postSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

// Define the Post model
const Post = mongoose.model('Post', postSchema)

// Export the Post model
module.exports = Post