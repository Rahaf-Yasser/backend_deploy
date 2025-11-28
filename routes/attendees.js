const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  invite,
  updateStatus,
  getAttendees
} = require("../controllers/attendeeController");

// Invite attendee
router.post("/:eventId/invite", auth, invite);

// Update RSVP status (Going/Maybe/Not Going)
router.put("/:eventId/status", auth, updateStatus);

// List attendees for an event
router.get("/:eventId", auth, getAttendees);

module.exports = router;
