const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'A user must have a username']
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'A user must have a password']
    },
    bio: {
        type: String
    },
    profilePicture: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;