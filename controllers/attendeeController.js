const db = require("../db");

// Invite attendee
exports.invite = (req, res) => {
  const { eventId } = req.params;
  const { email, user_id, role } = req.body;
  const invitedBy = req.userId;

  // Check if requester is organizer
  db.query(
    `SELECT * FROM event_attendees 
     WHERE event_id = ? AND user_id = ? AND role = 'organizer'`,
    [eventId, invitedBy],
    (err, rows) => {
      if (rows.length === 0)
        return res.status(403).json({ message: "Only organizer can invite" });

      let sql, params;
      const finalRole = role || "attendee";

      if (user_id) {
        sql = `
          INSERT INTO event_attendees (event_id, user_id, role, status, invited_by)
          VALUES (?, ?, ?, 'invited', ?)
        `;
        params = [eventId, user_id, finalRole, invitedBy];
      } else {
        sql = `
          INSERT INTO event_attendees (event_id, email, role, status, invited_by)
          VALUES (?, ?, 'attendee', 'invited', ?)
        `;
        params = [eventId, email, invitedBy];
      }

      db.query(sql, params, (err) => {
        if (err && err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "Already invited" });

        res.json({ message: "Invitation sent" });
      });
    }
  );
};

// Update attendance status
exports.updateStatus = (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;
  const userId = req.userId;

  db.query(
    `UPDATE event_attendees 
     SET status = ?, responded_at = NOW()
     WHERE event_id = ? AND user_id = ?`,
    [status, eventId, userId],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Status updated" });
    }
  );
};

// Get attendees for event
exports.getAttendees = (req, res) => {
  db.query(
    `SELECT * FROM event_attendees WHERE event_id = ?`,
    [req.params.eventId],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
};
