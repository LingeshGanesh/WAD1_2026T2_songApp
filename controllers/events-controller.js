const fs = require('fs/promises');

// Get Service model
const Event = require('./../models/events-model');
const User = require('./../models/users-model');

exports.getIndex = async (req, res) => {
    try {
        const upcomingEvents = await Event.getUpcomingEvents();
        res.render("events/home-events", { upcomingEvents });
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};


// Controller function to get all the documents in the db and display it
exports.showEvents = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        const user = await User.findUserByEmail(req.session.user.email);
        const filter = req.query.filter;
        const now = new Date();

        let eventList = await Event.retrieveAll();

        // show depending on which
        // filter is the function that does for each event it'll only return if it meets the condition after =>
        if (filter === 'past') {
            eventList = eventList.filter(event => new Date(event.date) < now);
        } else if (filter === 'attending') {
            eventList = eventList.filter(event => user.events.some(id => id.equals(event._id)));
        } else {
            eventList = eventList.filter(event => new Date(event.date) >= now);
        }

        res.render("events/display-events", { eventList, userId, userEvents: user.events, followings: user.followings, filter });
    } catch (error) {
        console.error(error);
        res.send("Error reading database");
    }
};

exports.showAddForm = (req, res) => {
    try {
        res.render("events/add-event", { result: undefined, msg: undefined });
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};

exports.createEvent = async (req, res) => {
    try {
        // get user input
        const name = req.body.name;
        const desc = req.body.desc;
        const date = new Date(req.body.date + ':00+08:00'); // so have time with date
        const entryFee = req.body.entryFee;
        const location = req.body.location;
        const capacity = req.body.capacity;

        const userId = req.session.user?.id;
        if (!userId) {
        return res.redirect("/login");
        }

        // form validation

        // create structure that stores new event
        let newEvent = { name: name, desc: desc, date: date, entryFee: entryFee, location: location, author: userId, capacity: capacity };

        try {
            let msg = `Event ${name} has been added successfully`;
            let result = await Event.addEvent(newEvent);
            console.log("event added:" + result);

            res.render("events/success", { msg: msg, redirectUrl: "/events/user-events"});

        } catch (error) {
            console.log(error);

            let msg = "Please fix the following issues:";

        if (error.name === "ValidationError") {
            msg += "<br><ul>" + Object.values(error.errors) //initialize list
                .map(err => `<li>${err.message}</li>`) // changes the errors into point form
                .join("") + "</ul>"; // close the list
        }
            let result = "fail";
            res.render("events/add-event", { result, msg });
        }

    } catch (error) {
        console.error(error);
    }
};

exports.showEventList = async (req, res) => {
    try {
        const userId = req.session.user.id;
        let events = await Event.retrieveByAuthor(userId);
        console.log(events);
        res.render("events/user-events", { events });
    } catch (error) {
        console.error(error);
        res.send("Error reading database");
    }
};

exports.viewEvent = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findUserByID(userId);
        const event = await Event.findById(req.query.id);
        res.render("events/view-event", { event, userId, userEvents: user.events });
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};

exports.getEvent = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const id = req.query.id;
        const msg = req.query.msg;
        const result = await Event.findByIdAndAuthor(id, userId);
        // prevents bypassing using url
        if (new Date() > new Date(result.date)){
            return res.redirect("/events/user-events");
        }
        res.render("events/update-event", { result, msg });
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
};

exports.updateEvent = async (req, res) => {
    const userId = req.session.user.id;
    const id = req.body.id;
    
    try {
        console.log('id'+id);
        const name = req.body.name;
        console.log('name:'+name);
        const desc = req.body.desc;
        const date = req.body.date;
        const entryFee = req.body.entryFee;
        const location = req.body.location;
        const capacity = req.body.capacity;

        const old = await Event.findByIdAndAuthor(id, userId);
        console.log(old.participants);

        let success = await Event.editEvent(id, userId, name, desc, date, entryFee, location, capacity);

        if (old.participants.length > 0) {
            // initialize to push all changes to be sent as a message
            const changes = [];
            if (old.desc !== desc) changes.push(`Description changed to ${desc}`);
            // convert to different format for comparison
            if (old.date.toISOString().slice(0, 16) !== new Date(date + ':00+08:00').toISOString().slice(0, 16)) changes.push(`Date changed to ${date}`);
            if (String(old.entryFee) !== String(entryFee)) changes.push(`Price changed to $${entryFee}`);
            if (old.location !== location) changes.push(`Location changed to ${location}`);
            if (String(old.capacity) !== String(capacity)) changes.push(`Capacity changed to ${capacity}`);
            // send only if at least one field has been changed
            if (changes.length > 0) {
                const alertResult = await User.addAlertToMany(old.participants, `${name} has been updated: ${changes.join(', ')}`);
                console.log(alertResult);
            }
        }
        console.log('sending alert to', old.participants.length, 'participants');

        let msg = `Event ${name} has been editted successfully`;
        console.log(success);
        res.render("events/success", { msg: msg, redirectUrl: "/events/user-events"});
    } catch (error) {
        console.log(error);

        let msg = "Please fix the following issues:";

    if (error.name === "ValidationError") {
        msg += "<br><ul>" + Object.values(error.errors)
            .map(err => `<li>${err.message}</li>`)
            .join("") + "</ul>";
    }
        const result = await Event.findByIdAndAuthor(id, userId);
         res.render("events/update-event", { result, msg });
    }
};

exports.deleteAnEvent = async (req, res) => {
    try {

        const userId = req.session.user.id;
        const id = req.body.id;
        const name = req.body.name;

        const old = await Event.findByIdAndAuthor(id, userId);
        if (old.participants.length > 0) await User.addAlertToMany(old.participants, `${name} has been deleted`);

        let success = await Event.deleteEvent(id, userId);
        console.log(success);

        if (success.deletedCount === 1) {
            let msg = `Event ${name} has been deleted successfully`;
            res.render("events/success", { msg: msg, redirectUrl: "/events/user-events"});
        }

    } catch (error) {
        console.error(error);
    }
};

exports.getMarkedEvent = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const id = req.query.id;
        console.log(id);

        const result = await Event.findByIdAndAuthor(id, userId);
        res.render("events/delete-event", { result });

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
};

exports.showForm = (req, res) => {
    try {
        res.render("events/search-event", { result: undefined, searchTerm: undefined });
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};

exports.submitEvent = async (req, res) => {
    try {
        const name = req.body.name;
        console.log(name);

        if (name === "") {
            console.log("ERROR: empty input");
            return res.render("events/search-event", { result: undefined, searchTerm: "" });
        }

        const result = await Event.findByName(name);
        console.log("result:" + result);
        res.render("events/search-event", { result: result || null, searchTerm: name });

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
};

exports.attendEvent = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const eventId = req.body.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.send("Event not found");
    }

    if (event.author.toString() === userId) {
      return res.send("You cannot add your own event");
    }

    if (event.participants.length >= event.capacity) {
        return res.send("Event is full")
    }

    await User.updateOne({ _id: userId }, { $addToSet: { events: eventId } });
    await Event.updateOne({ _id: eventId }, { $addToSet: { participants: userId } });

    res.render("events/success", {
      msg: "Event added successfully",
      redirectUrl: "/events/event-list"
    });
  } catch (error) {
    console.error(error);
    res.send("Error adding event");
  }
};

exports.removeEvent = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const eventId = req.body.eventId;

    await User.updateOne({ _id: userId }, { $pull: { events: eventId } });
    await Event.updateOne({ _id: eventId }, { $pull: { participants: userId } });

    res.render("events/success", {
      msg: "Event removed successfully",
      redirectUrl: "/events/event-list"
    });
  } catch (error) {
    console.error(error);
    res.send("Error removing event");
  }
};