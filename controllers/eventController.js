const db = require("../db");

// ---------------------
// CREATE EVENT
// ---------------------
exports.createEvent = (req, res) => {
  const { title, description, location, start_datetime, end_datetime } = req.body;
  const creatorId = req.userId;

  // Create event
  db.query(
    `INSERT INTO events (title, description, location, start_datetime, end_datetime, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, location, start_datetime, end_datetime, creatorId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const eventId = result.insertId;

      // Mark user as ORGANIZER in event_attendees
      db.query(
        `INSERT INTO event_attendees (event_id, user_id, role, status, invited_by)
         VALUES (?, ?, 'organizer', 'going', ?)`,
        [eventId, creatorId, creatorId]
      );

      // Update user.role globally
      db.query(
        `UPDATE users SET role = 'Organizer' WHERE id = ?`,
        [creatorId]
      );

      res.json({ message: "Event created successfully", eventId });
    }
  );
};



// ---------------------
// ADD ATTENDEE
// ---------------------
exports.addAttendee = (req, res) => {
  const organizerId = req.userId;
  const { eventId } = req.params;
  const { attendeeId } = req.body;

  // Check organizer permission
  db.query(
    `SELECT * FROM event_attendees 
     WHERE event_id = ? AND user_id = ? AND role = 'organizer'`,
    [eventId, organizerId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0)
        return res.status(403).json({ message: "Only organizer can add attendees" });

      // Insert attendee
      db.query(
        `INSERT INTO event_attendees (event_id, user_id, role, status, invited_by)
         VALUES (?, ?, 'attendee', 'invited', ?)`,
        [eventId, attendeeId, organizerId],
        (err2) => {
          if (err2) return res.status(500).send(err2);
          res.json({ message: "Attendee added successfully" });
        }
      );
    }
  );
};


// ---------------------
// GET MY EVENTS
// ---------------------
exports.getMyEvents = (req, res) => {
  db.query(
    `SELECT e.*, a.role, a.status
     FROM events e
     JOIN event_attendees a ON e.id = a.event_id
     WHERE a.user_id = ?`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
};


// ---------------------
// DELETE EVENT
// ---------------------
exports.deleteEvent = (req, res) => {
  const { eventId } = req.params;
  const userId = req.userId;

  db.query(
    `DELETE FROM events 
     WHERE id = ? AND created_by = ?`,
    [eventId, userId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0)
        return res.status(403).json({ message: "Not allowed" });

      res.json({ message: "Event deleted" });
    }
  );
};


// ---------------------
// GET EVENT BY ID
// ---------------------
exports.getEventById = (req, res) => {
  const { eventId } = req.params;

  db.query(
    "SELECT * FROM events WHERE id = ?",
    [eventId],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      if (rows.length === 0)
        return res.status(404).json({ message: "Event not found" });

      res.json(rows[0]);
    }
  );
};


// ---------------------
// UPDATE EVENT (ONLY ORGANIZER)
// ---------------------
exports.updateEvent = (req, res) => {
  const { eventId } = req.params;
  const { title, description, location, start_datetime, end_datetime } = req.body;
  const userId = req.userId;

  // Ensure user is organizer
  db.query(
    `SELECT * FROM event_attendees 
     WHERE event_id = ? AND user_id = ? AND role = 'organizer'`,
    [eventId, userId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0)
        return res.status(403).json({ message: "Only organizer can update event" });

      const sql = `
        UPDATE events 
        SET title=?, description=?, location=?, start_datetime=?, end_datetime=?
        WHERE id=?
      `;

      db.query(
        sql,
        [title, description, location, start_datetime, end_datetime, eventId],
        (err2) => {
          if (err2) return res.status(500).send(err2);
          res.json({ message: "Event updated successfully" });
        }
      );
    }
  );
};
