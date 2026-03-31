const mongoose = require('mongoose');

//import model
const Song = require('./songs-model');
const Review = require('./reviews-model');
const Playlist = require('./playlists-model');
const Event = require('./events-model');
const Album = require('./albums-model');


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

//find multiple users by ids
//https://www.mongodb.com/docs/manual/reference/operator/query/in/
exports.findUsers = function (id) {
    return User.find({ _id: { $in: id } })
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
// exports.deleteUser = function (id) {
//     return User.deleteOne({ _id: id })
// }

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

//delete evrything user created and delete user
exports.deleteUserAndData = async (userId) => {

    //reviews
    await Review.deleteMany({ userId });

    //playlists
    await Playlist.deleteMany({ userId });

    //events
    await Event.deleteMany({ author: userId });

    //also remove user from participants
    await Event.updateMany(
        {},
        { $pull: { participants: userId } }
    );

    //albums
    await Album.deleteMany({ userId });

    //songs
    await Song.deleteMany({ userId });

    //remove from other users
    await User.updateMany(
        {},
        {
            $pull: {
                followers: userId,
                followings: userId
            }
        }
    );

    //delete user
    await User.deleteOne({ _id: userId });
};

//get suggested users 
exports.getSuggestedUsers = async function (currentUserId) {
    const currentUser = await User.findById(currentUserId);

    const users = await User.find({
        _id: { $ne: currentUserId }
    });

    const currentFollowings = currentUser.followings.map(f => f.toString());

    let suggestions = [];

    for (let user of users) {

        // skip if already following
        if (currentFollowings.includes(user._id.toString())) continue;

        // // mutual followers
        // const mutualFollowers = user.followers.filter(f =>
        //     currentUser.followings.includes(f.toString())
        // );

        // // mutual followings
        // const mutualFollowings = user.followings.filter(f =>
        //     currentUser.followings.includes(f.toString())
        // );

        //check only shared followings
        const sharedFollowings = user.followings.filter(f =>
            currentFollowings.includes(f.toString())
        );

        const sharedFollowingUsers = await User.find(
            { _id: { $in: sharedFollowings } },
            { username: 1, profilePicture: 1 }
        );

        const score = sharedFollowings.length

        if (score > 0) {
            suggestions.push({
                user,
                score,
                sharedFollowings: sharedFollowingUsers
            });
        }

    }
    // sort by highest score
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions.slice(0, 5); // top 5
};

//update event in user
exports.updateOne = function (filter, update) {
    return User.updateOne(filter, update);
}

