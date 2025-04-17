const mongoose = require('mongoose')
const Schema = mongoose.Schema

const voteSchema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  vote: {
    type: Boolean,
    required: true,
  }
}

module.exports = voteSchema