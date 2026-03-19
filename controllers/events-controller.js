const fs = require('fs/promises');

// Get Service model
const Event = require('./../models/events-model');

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