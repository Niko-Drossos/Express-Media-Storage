const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SubUser = require('./SubUser')

const voteSchema = new Schema({
  user: {
    type: SubUser
  },
  vote: {
    type: Boolean,
    required: true,
  }
}, {
  timestamps: true
})

module.exports = voteSchema