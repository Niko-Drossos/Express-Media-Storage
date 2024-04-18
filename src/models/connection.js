const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()

const mongoURI = process.env.Mongo_Connection_Uri;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
