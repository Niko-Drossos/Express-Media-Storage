const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Hashed password
    password: {
        type: String,
        required: true,
    },
    // TODO: Add more fields
    // Other fields
}, {
    timestamps: true,
    collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
