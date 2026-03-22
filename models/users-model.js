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
    profilePicture: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

});

const User = mongoose.model('User', userSchema, 'users');

exports.createUser = function(newUser){
    return User.create(newUser);
}

exports.findUser = function(email){
    return User.findOne({email:email})
}