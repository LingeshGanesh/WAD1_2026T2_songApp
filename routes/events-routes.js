const express = require('express');

const eventsController = require('./../controllers/events-controller');

const router = express.Router(); // sub application

// Define a GET route to display the list of events
router.get("/event-list", eventsController.showEvents);

// Define a GET and POST route to display the search page for events
//router.get("/search-event", eventsController.showForm);
//router.post("/search-event", eventsController.submitEvent);

// Define paths for adding event
//router.get("/add-event", eventsController.showAddForm);
//router.post("/add-event", eventsController.createEvent);

// EXPORT
module.exports = router;