const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addAttendee
} = require("../controllers/eventController");

const { getAttendees, invite, updateStatus } = require("../controllers/attendeeController");

// Create event
router.post("/", auth, createEvent);

// Get events for logged user
router.get("/", auth, getMyEvents);

// Get event by ID
router.get("/:eventId", auth, getEventById);

// Update event
router.put("/:eventId", auth, updateEvent);

// Delete event
router.delete("/:eventId", auth, deleteEvent);

//Get Attendees
router.get("/:eventId/attendees", auth, getAttendees);

router.post("/:eventId/invite", auth, invite);

// Update RSVP status
router.put("/:eventId/rsvp", auth, updateStatus);

// Adding attendees
router.post("/:eventId/attendees", auth, addAttendee);

module.exports = router;
