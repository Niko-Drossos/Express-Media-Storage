const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const { Mongo_Connection_Uri } = process.env

// Connect to MongoDB using Mongoose
const connectDB = () => mongoose.connect(Mongo_Connection_Uri)
const connection = mongoose.connection

connection.on('connected', () => {
  console.log('MongoDB connected successfully')
})
 
module.exports = { connectDB, connection }