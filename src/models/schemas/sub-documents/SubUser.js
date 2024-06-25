const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subUserSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
}, {
  _id: false
})

module.exports = subUserSchema