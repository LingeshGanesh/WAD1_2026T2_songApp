const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An event must have a name']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    desc: {
        type: String,
        required: [true, 'An event must have a description']
    },
    date: {
        type: Date,
        required: [true, 'An event must have a date']
    },
    entryFee: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        required: [true, 'An event must have a location']
    }
});

const Event = mongoose.model('Event', eventSchema, 'events');

exports.findByName = function(name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Event.find({ name: { $regex: escapedName, $options: 'i' } });
};

exports.retrieveAll = function() {
    return Event.find();
};

exports.addEvent = function(newEvent) {
    return Event.create(newEvent);
};

exports.editEvent = function(id, authorId, name, desc, date, entryFee, location) {
    return Event.updateOne(
        { _id: id, author: authorId },
        { name: name, desc: desc, date: date, entryFee: entryFee, location: location }
    );
};

exports.retrieveByAuthor = function(authorId) {
    return Event.find({ author: authorId });
};

exports.findByIdAndAuthor = function(id, authorId) {
    return Event.findOne({ _id: id, author: authorId });
};

exports.deleteEvent = function(id, authorId) {
    return Event.deleteOne({ _id: id, author: authorId });
};

exports.getUpcomingEvents = function() {
    return Event.find().sort({ date: 1 }).limit(3);
};