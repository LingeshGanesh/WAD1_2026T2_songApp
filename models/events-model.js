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
        required: [true, 'An event must have a start time'],
        validate: {
            validator: function(value) {
                const now = new Date();

                const maxDate = new Date(now);
                maxDate.setMonth(maxDate.getMonth() + 3);

                return value >= now && value <= maxDate;
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
    },
    capacity: {
        type: Number,
        required: [true, 'An event must have a participant limit'],
        min: [1, 'Capacity must be at least 1']
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Event = mongoose.model('Event', eventSchema, 'events');

exports.findByName = function(name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Event.find({ name: { $regex: escapedName, $options: 'i' } });
};

exports.retrieveAll = function() {
    // return Event.find().populate('participants', 'username');
    return Event.find().populate('participants', 'username profilePicture')
    .populate('author', 'username profilePicture')
    .sort({ date: 1 });
};

exports.addEvent = function(newEvent) {
    return Event.create(newEvent);
};

exports.editEvent =  async function(id, authorId, name, desc, date, entryFee, location, capacity) {
    const doc = await Event.findOne({ _id: id, author: authorId });

    if (capacity < doc.participants.length) {
        const err = new Error('Capacity cannot be lower than current number of registered participants');
        err.name = 'CapacityError';
        throw err;
    }

    Object.assign(doc, { name, desc, date, entryFee, location, capacity });
    return doc.save();
};

exports.retrieveByAuthor = function(authorId) {
    return Event.find({ author: authorId });
};

exports.findByIdAndAuthor = function(id, authorId) {
    return Event.findOne({ _id: id, author: authorId });
};

// has populate so we can show name and profile pic in single evenmt page
exports.findById = function(id) {
    return Event.findOne({ _id: id }).populate('participants', 'username profilePicture');
};

exports.deleteEvent = function(id, authorId) {
    return Event.deleteOne({ _id: id, author: authorId });
};

exports.getUpcomingEvents = function() {
    return Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(3);
};

exports.updateOne = function(filter, update) {
    return Event.updateOne(filter, update);
}

//delete many - Carolyn
exports.deleteManyByAuthorId = function (authorId) {
    return Event.deleteMany({ author: authorId });
};

exports.removeParticipantFromAllEvents = function (userId) {
    return Event.updateMany({}, { $pull: { participants: userId } });
};
// end of delete many