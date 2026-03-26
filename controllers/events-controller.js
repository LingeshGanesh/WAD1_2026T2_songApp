const fs = require('fs/promises');

// Get Service model
const Event = require('./../models/events-model');

exports.getIndex = async (req, res) => {
  res.render("events/home-events");
};

//DUMMY USER ID TO BE USED ONLY UNTIL AUTH AND SESSION IS ONLINE
const userId = "69bc23ebd3cd6548aad26bdb";
// DUMMY
// DUMMY
// DUMMY
// REMEMBER TO CHANGE LATER PLEASE

// Controller function to get all the documents in the db and display it
exports.showEvents = async (req, res) => {
  try {
    let eventList = await Event.retrieveAll();// fetch all the list    
    console.log(eventList);
    res.render("events/display-events", { eventList }); // Render the EJS form view and pass the posts
  } catch (error) {
    console.error(error);
    res.send("Error reading database"); // Send error message if fetching fails
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

        // form validation

        // create structure that stores new event
        let newEvent = { name: name, desc: desc, date: date, entryFee: entryFee, location: location, author: userId };

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
    const userId = "69bc23ebd3cd6548aad26bdb";

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
    const userId = "69bc23ebd3cd6548aad26bdb";
    const id = req.query.id;
    const msg = req.query.msg;
    console.log(id);
    console.log("getting event")

    try {
        const result = await Event.findByIdAndAuthor(id, userId);
        res.render("events/update-event", { result, msg });
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
};

exports.updateEvent = async (req, res) => {
    const userId = "69bc23ebd3cd6548aad26bdb";

    const id = req.body.id;
    console.log('id'+id);
    const name = req.body.name;
    console.log('name:'+name);
    const desc = req.body.desc;
    const date = req.body.date;
    const entryFee = req.body.entryFee;
    const location = req.body.location;

    try {
        let msg = `Event ${name} has been editted successfully`;
        let success = await Event.editEvent(id, userId, name, desc, date, entryFee, location);
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
    const userId = "69bc23ebd3cd6548aad26bdb";
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
    const userId = "69bc23ebd3cd6548aad26bdb";
    const id = req.query.id;
    console.log(id);

    try {
        const result = await Event.findByIdAndAuthor(id, userId);
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