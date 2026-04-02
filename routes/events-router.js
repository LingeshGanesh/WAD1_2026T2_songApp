const express = require('express');

const eventsController = require('./../controllers/events-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router(); // sub application

// Loading the events landing page
router.get('/', authMiddleware.isLoggedIn, eventsController.getIndex);

// Routes for single event page
router.get("/view-event", authMiddleware.isLoggedIn, eventsController.viewEvent);

// Define a GET route to display the list of events
router.get("/event-list", authMiddleware.isLoggedIn, eventsController.showEvents);
router.post("/event-list", authMiddleware.isLoggedIn, eventsController.attendEvent);
router.post("/event-list/remove", authMiddleware.isLoggedIn, eventsController.removeEvent);

// Define a GET and POST route to display the search page for events
router.get("/search-event", authMiddleware.isLoggedIn, eventsController.showForm);
router.post("/search-event", authMiddleware.isLoggedIn, eventsController.submitEvent);

// Define paths for adding event
router.get("/add-event", authMiddleware.isLoggedIn, eventsController.showAddForm);
router.post("/add-event", authMiddleware.isLoggedIn, eventsController.createEvent);

// Define paths for editting events THAT THE USER HAS CREATED ONLY
router.get("/user-events", authMiddleware.isLoggedIn, eventsController.showEventList);
router.get("/update-event", authMiddleware.isLoggedIn, eventsController.getEvent);
router.post("/update-event", authMiddleware.isLoggedIn, eventsController.updateEvent);

// Define paths for deleting event
router.get("/delete-event", authMiddleware.isLoggedIn, eventsController.getMarkedEvent);
router.post("/delete-event", authMiddleware.isLoggedIn, eventsController.deleteAnEvent);

// EXPORT
module.exports = router;