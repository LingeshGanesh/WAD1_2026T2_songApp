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
    return Event.find({ name: name });
};

exports.retrieveAll = function() {
    return Event.find();
};

exports.addEvent = function(newEvent) {
    return Event.create(newEvent);
};

exports.editEvent = function(id, name, desc, date, entryFee, location) {
    return Event.updateOne(
        { _id: id },
        { name: name, desc: desc, date: date, entryFee: entryFee, location: location }
    );
};

exports.deleteEvent = function(id) {
    return Event.deleteOne({ _id: id });
};

exports.getUpcomingEvents = function() {
    return Event.find().sort({ date: 1 }).limit(3);
};

// module.exports = Event;

exports.addEvent = function(newEvent) {
    return Event.create(newEvent);
}