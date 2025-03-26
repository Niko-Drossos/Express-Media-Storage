const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
}, {
  collection: 'roles'
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role