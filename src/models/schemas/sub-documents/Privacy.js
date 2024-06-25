const mongoose = require('mongoose')
const Schema = mongoose.Schema

const privacySchema = new Schema({
  type: {
    type: String,
    // This will later change to allow levels of friends to see
    enum: ['Public', 'Private', 'Unlisted'],
    default: 'Private',
    required: false
  }
})

module.exports = privacySchema