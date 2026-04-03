const express = require('express');

const eventsController = require('./../controllers/events-controller');

const router = express.Router(); // sub application

// Loading the events landing page
router.get('/', eventsController.getIndex);

// Routes for single event page
router.get("/view-event", eventsController.viewEvent);

// Define a GET route to display the list of events
router.get("/event-list", eventsController.showEvents);
router.post("/event-list", eventsController.attendEvent);
router.post("/event-list/remove", eventsController.removeEvent);

// Define a GET and POST route to display the search page for events
router.get("/search-event", eventsController.showForm);
router.post("/search-event", eventsController.submitEvent);

// Define paths for adding event
router.get("/add-event", eventsController.showAddForm);
router.post("/add-event", eventsController.createEvent);

// Define paths for editting events THAT THE USER HAS CREATED ONLY
router.get("/user-events", eventsController.showEventList);
router.get("/update-event", eventsController.getEvent);
router.post("/update-event", eventsController.updateEvent);

// Define paths for deleting event
router.get("/delete-event", eventsController.getMarkedEvent);
router.post("/delete-event", eventsController.deleteAnEvent);

// EXPORT
module.exports = router;