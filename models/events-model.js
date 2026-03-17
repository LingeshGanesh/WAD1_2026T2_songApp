const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An event must have a name']
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

module.exports = Event;