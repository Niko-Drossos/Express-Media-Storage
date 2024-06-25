const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SubUser = require('./SubUser')

const voteSchema = new Schema({
  user: {
    type: SubUser,
    select: false
  },
  vote: {
    type: Boolean,
    required: true,
    select: false
  }
}, {
  _id: false
})

module.exports = voteSchema