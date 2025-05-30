const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')

/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
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
  avatarId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  aboutMe: {
    type: String,
    required: false
  },
  tags: {
    type: [String],
    default: []
  },
  favorites: {
    videos: [{
      type: Schema.Types.ObjectId,
      ref: 'Video',
      select: false
    }], 
    images: [{
      type: Schema.Types.ObjectId,
      ref: 'Image',
      select: false
    }],
    audios: [{
      type: Schema.Types.ObjectId,
      ref: 'Audio',
      select: false
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      select: false
    }],
    pools: [{
      type: Schema.Types.ObjectId,
      ref: 'Pool',
      select: false
    }]
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
  pools: [{
    type: Schema.Types.ObjectId,
    ref: 'Pool',
    select: false
  }],
  votes: [{
    type: Vote,
    select: false
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  settings: {
    type: {
      theme: {
        type: String,
        enum: ["Dark", "Light"],
        default: "Dark"
      }, 
      privacy: {
        type: String,
        enum: ["Private", "Public", "Unlisted"],
        default: "Private"
      },
      // TODO: Add more settings
    }
  },
  roles: {
    type: [Schema.Types.ObjectId],
    ref: 'Role',
    default: []
  },
  // TODO: Next update
  /* groups: {
    type: [Schema.Types.ObjectId],
    ref: 'Group',
    default: []
  } */
}, {
  timestamps: true,
  collection: 'users'
})

/* --------------------------------- Indexes -------------------------------- */

// Already created because of unique username
// userSchema.index({ username: 1 })

userSchema.index({ tags: 1 })

/* ------------------------------- Middleware ------------------------------- */

userSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

const User = mongoose.model('User', userSchema)

module.exports = User