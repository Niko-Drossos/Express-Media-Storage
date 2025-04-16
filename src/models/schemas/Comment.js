const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Vote = require('./sub-documents/Vote')
const SubUser = require('./sub-documents/SubUser')

/* ------------------------------- Middleware ------------------------------- */
const updateVoteCount = require('../middleware/mongoose/updateVoteCount')
/* -------------------------------------------------------------------------- */

const commentSchema = new Schema({
  // user: SubUser,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now
  },
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
    type: {
      isDeleted: {
        type: Boolean,
        default: false
      },
      date: { 
        type: Date,
        default: Date.now()
      }
    },
    default: {
      isDeleted: false,
      date: Date.now()
    },
    _id: false
  },
  originType: {
    type: String,
    enum: ['Pool', 'Comment', 'User', 'Video', 'Image', 'Audio'],
    required: true
  },
  originId: {
    type: Schema.Types.ObjectId,
    refPath: 'originType',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  collection: 'comments'
})

/* --------------------------------- Indexes -------------------------------- */

commentSchema.index({ content: 'text' })

/* ------------------------------- Middleware ------------------------------- */

commentSchema.pre('save', function (next) { 
  updateVoteCount.call(this, next)
})

/* --- Validate that that the originType and originId combination is valid -- */

commentSchema.path('originId').validate(function(value) {
  // Validate that the originType and originId combination is valid
  const modelNames = ['Pool', 'Comment', 'User', 'Video', 'Image', 'Audio'];
  return modelNames.includes(this.originType) && value != null;
}, 'Invalid combination of originType and originId');

/* -------------------------------------------------------------------------- */

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment