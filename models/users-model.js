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
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followings: [{
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

//find all 
exports.retrieveAll = function () {
    return User.find();
};

//create new user
exports.createUser = function (newUser) {
    return User.create(newUser);
}

//find user by id
exports.findUserByID = function (id) {
    return User.findOne({ _id: id })
}

//find user by email
exports.findUserByEmail = function (email) {
    return User.findOne({ email: email })
}

//find user by username
exports.findUserByUsername = function (username) {
    return User.findOne({ username: username })
}

//update user by id
exports.updateUserByID = function (id, username, email, profilePicture) {
    return User.updateOne({ _id: id }, { username: username, email: email, profilePicture: profilePicture })
}

//update password by id
exports.updatePasswordByID = function (id, password) {
    return User.updateOne({ _id: id }, { password: password });
}

//delete user
exports.deleteUser = function (id) {
    return User.deleteOne({ _id: id })
}

//search users 
exports.searchUsers = function (query, currentUserId) {
    //https://stackoverflow.com/questions/76149327/how-to-solve-redos-pointed-out-by-snyk
    //all special regular expression characters escaped
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return User.find({
        //https://www.mongodb.com/docs/manual/reference/operator/query/regex/
        // i matches lower or uppercase
        // ^ matches beginning of the line
        username: { $regex: '^' + escapedQuery, $options: 'i' },
        //https://www.mongodb.com/docs/manual/reference/mql/query-predicates/ 
        _id: { $ne: currentUserId } // exclude yourself
    }).limit(10);
}

// update following & followers
//https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/
exports.followUser = function (currentUserId, targetUserId) {
    return Promise.all([
        User.updateOne(
            { _id: currentUserId },
            { $addToSet: { followings: targetUserId } }
        ),
        User.updateOne(
            { _id: targetUserId },
            { $addToSet: { followers: currentUserId } }
        )
    ]);
};

//https://www.mongodb.com/docs/manual/reference/operator/update/pull/
exports.unfollowUser = function (currentUserId, targetUserId) {
    return Promise.all([
        User.updateOne(
            { _id: currentUserId },
            { $pull: { followings: targetUserId } }
        ),
        User.updateOne(
            { _id: targetUserId },
            { $pull: { followers: currentUserId } }
        )
    ]);
};

//update event in user
exports.updateOne = function (filter, update) {
    return User.updateOne(filter, update);
}

