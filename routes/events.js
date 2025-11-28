const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createEvent,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

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

module.exports = router;
