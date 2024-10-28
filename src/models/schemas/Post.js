const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')
const Privacy = require('./sub-documents/Privacy')

/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../helpers/calculateVoteCount')
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
    }
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    date: { 
      type: Date || null,
      default: null
    }
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
postSchema.pre('save', function(next) {
  this.voteCount = calculateVoteCount(this.votes)
  console.log(this.votes)
  next()
})

// Define the Post model
const Post = mongoose.model('Post', postSchema)

// Export the Post model
module.exports = Post