/* --------------------------------- Schemas -------------------------------- */
const User = require('./schemas/User')
const Pool = require('./schemas/Pool')
const Comment = require('./schemas/Comment')
const Video = require('./schemas/Video')
const Image = require('./schemas/Image')
const Audio = require('./schemas/Audio')
/* -------------------------------------------------------------------------- */

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const { Mongo_Connection_Uri } = process.env

// Connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    mongoose.connect(Mongo_Connection_Uri, {
      autoIndex: false, // Disable automatic index creation
    })

    await User.syncIndexes()
    await Pool.syncIndexes()
    await Comment.syncIndexes()
    await Video.syncIndexes()
    await Image.syncIndexes()
    await Audio.syncIndexes()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    
  }
}

const connection = mongoose.connection

connection.on('connected', () => {
  console.log('MongoDB connected successfully')
})
 
module.exports = { connectDB }