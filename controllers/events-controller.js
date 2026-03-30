const fs = require('fs/promises');

// Get Service model
const Event = require('./../models/events-model');
const User = require('./../models/users-model');

exports.getIndex = async (req, res) => {
  res.render("events/home-events");
};

//DUMMY USER ID TO BE USED ONLY UNTIL AUTH AND SESSION IS ONLINE
//const userId = req.session.user.id;


// Controller function to get all the documents in the db and display it
exports.showEvents = async (req, res) => {
  try {
    let eventList = await Event.retrieveAll();
    const userId = req.session.user?.id;

    if (!userId) {
      return res.redirect("/login");
    }

    const user = await User.findUserByEmail(req.session.user.email); // ADD THIS

    res.render("events/display-events", { eventList, userId, userEvents: user.events, followings: user.followings }); // ADD userEvents
  } catch (error) {
    console.error(error);
    res.send("Error reading database");
  }
};

exports.showAddForm = (req, res) => {
    res.render("events/add-event", { result: undefined, msg: undefined });
};

exports.createEvent = async (req, res) => {
    try {
        // get user input
        const name = req.body.name;
        const desc = req.body.desc;
        const date = req.body.date;
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

            res.render("events/success", { msg: msg, redirectUrl: "/events/edit-events"});

        } catch (error) {
            console.log(error);

            let msg = "Please fix the following issues:";

        if (error.name === "ValidationError") {
            msg += "<br><ul>" + Object.values(error.errors)
                .map(err => `<li>${err.message}</li>`)
                .join("") + "</ul>";
        }
            let result = "fail";
            res.render("events/add-event", { result, msg });
        }

    } catch (error) {
        console.error(error);
    }
};

exports.showEventList = async (req, res) => {
    const userId = req.session.user.id;

    try {
        let events = await Event.retrieveByAuthor(userId);
        console.log(events);
        res.render("events/edit-event", { events });
    } catch (error) {
        console.error(error);
        res.send("Error reading database");
    }
};

exports.getEvent = async (req, res) => {
    const userId = req.session.user.id;
    const id = req.query.id;
    const msg = req.query.msg;
    console.log(id);
    console.log("getting event")

    try {
        const result = await Event.findByIdAndAuthor(id, userId);
        // prevents bypassing using url
        if (new Date() > new Date(result.date)){
            return res.redirect("/events/edit-events");
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
    console.log('id'+id);
    const name = req.body.name;
    console.log('name:'+name);
    const desc = req.body.desc;
    const date = req.body.date;
    const entryFee = req.body.entryFee;
    const location = req.body.location;
    const capacity = req.body.capacity;

    try {
        let msg = `Event ${name} has been editted successfully`;
        let success = await Event.editEvent(id, userId, name, desc, date, entryFee, location, capacity);
        console.log(success);
        res.render("events/success", { msg: msg, redirectUrl: "/events/edit-events"});
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
    const userId = req.session.user.id;
    const id = req.body.id;
    const name = req.body.name;
    console.log("name"+name);

    try {
        let success = await Event.deleteEvent(id, userId);
        console.log(success);

        if (success.deletedCount === 1) {
            let msg = `Event ${name} has been deleted successfully`;
            res.render("events/success", { msg: msg, redirectUrl: "/events/edit-events"});
        }

    } catch (error) {
        console.error(error);
    }
};

exports.getMarkedEvent = async (req, res) => {
    const userId = req.session.user.id;
    const id = req.query.id;
    console.log(id);

    try {
        const result = await Event.findByIdAndAuthor(id, userId);
        // prevents bypassing using url
        if (new Date() > new Date(result.date)){
            return res.redirect("/events/edit-events");
        }
        res.render("events/show-an-event", { result });

    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
};

exports.showForm = (req, res) => {
    res.render("events/search-event", { result: undefined, searchTerm: undefined });
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

    const event = await Event.findById({ _id: eventId });

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