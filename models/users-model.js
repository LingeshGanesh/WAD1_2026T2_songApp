const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'A user must have a username'],
        unique: true
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
        type: String,
        required: [true, 'A user must have a profile picture']
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema, 'users');

//create new user
exports.createUser = function (newUser) {
    return User.create(newUser);
}

//find user by email
exports.findUserByEmail = function (email) {
    return User.findOne({ email: email })
}

//update user by id
exports.updateUserByID = function(id, username, email, profilePicture){
    return User.updateOne({_id:id},{username:username, email:email, profilePicture: profilePicture})
}

//delete user
exports.deleteUser = function(id){
    return User.deleteOne({_id:id})
}

//search users 
exports.searchUsers = function(query, currentUserId) {
    return User.find({
        username: { $regex: '^' + query, $options: 'i' }, // starts with
        _id: { $ne: currentUserId } // exclude yourself
    }).limit(10);
};