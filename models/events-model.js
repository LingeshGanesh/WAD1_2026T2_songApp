const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An event must have a name'],
        trim: true,
        minlength: [3, 'Event name must be at least 3 characters'],
        maxlength: [30, 'Event name cannot exceed 30 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    desc: {
        type: String,
        required: [true, 'An event must have a description'],
        trim: true,
        maxlength: [100, 'Description cannot exceed 100 characters']
    },
    date: {
        type: Date,
        required: [true, 'An event must have a date'],
        validate: {
            validator: function(value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const maxDate = new Date(today);
                maxDate.setMonth(maxDate.getMonth() + 3);

                return value >= today && value <= maxDate;
            },
            message: 'Event date cannot be in the past and can only be scheduled up to 3 months in advance'
        }
    },
    entryFee: {
        type: Number,
        required: [true, 'An event must have an entry free, put 0 if your event has free entry'],
        default: 0,
        cast: 'Entry Fee must be a number',
        min: [0, 'Entry Fee cannot be negative']
    },
    location: {
        type: String,
        required: [true, 'An event must have a location'],
        trim: true
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

exports.editEvent =  async function(id, authorId, name, desc, date, entryFee, location) {
    const doc = await Event.findOne({ _id: id, author: authorId });
    Object.assign(doc, { name, desc, date, entryFee, location });
    return doc.save();
};

exports.retrieveByAuthor = function(authorId) {
    return Event.find({ author: authorId });
};

exports.findByIdAndAuthor = function(id, authorId) {
    return Event.findOne({ _id: id, author: authorId });
};

exports.findById = function(id) {
    return Event.findOne({ _id: id});
};


exports.deleteEvent = function(id, authorId) {
    return Event.deleteOne({ _id: id, author: authorId });
};

exports.getUpcomingEvents = function() {
    return Event.find().sort({ date: 1 }).limit(3);
};