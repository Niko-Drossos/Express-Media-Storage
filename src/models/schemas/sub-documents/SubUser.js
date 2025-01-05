const { Schema } = require('mongoose')

const subUserSchema = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
}

module.exports = subUserSchema