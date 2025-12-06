const db = require("../db");

//invite
exports.invite = (req, res) => {
  const { eventId } = req.params;
  const { email, username, user_id, role } = req.body;
  const invitedBy = req.userId;

  // Organizer permission check
  db.query(
    `SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ? AND role = 'organizer'`,
    [eventId, invitedBy],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length === 0)
        return res.status(403).json({ message: "Only organizer can invite" });

      const finalRole = role || "attendee";

      // 1️⃣ If user_id directly sent
      if (user_id) {
        return insertInvitation(eventId, user_id, finalRole, invitedBy, res);
      }

      // 2️⃣ If email sent
      if (email) {
        return findUserId(eventId, email, "email", finalRole, invitedBy, res);
      }

      // 3️⃣ If username sent
      if (username) {
        return findUserId(eventId, username, "username", finalRole, invitedBy, res);
      }

      res.status(400).json({ message: "Provide email, username, or user_id" });
    }
  );
};

function findUserId(eventId, value, field, role, invitedBy, res) {
  db.query(
    `SELECT id FROM users WHERE ${field} = ?`,
    [value],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length === 0)
        return res.status(404).json({ message: "User not found" });

      const userId = rows[0].id;
      insertInvitation(eventId, userId, role, invitedBy, res);
    }
  );
}

function insertInvitation(eventId, userId, role, invitedBy, res) {
  db.query(
    `INSERT INTO event_attendees (event_id, user_id, role, status, invited_by)
     VALUES (?, ?, ?, 'invited', ?)`,
    [eventId, userId, role, invitedBy],
    (err) => {
      if (err && err.code === "ER_DUP_ENTRY")
        return res.status(409).json({ message: "Already invited" });

      if (err) return res.status(500).json({ error: err });

      res.json({ message: "Invitation sent", userId });
    }
  );
};


//update status
exports.updateStatus = (req, res) => {
  const { eventId } = req.params;
  const userId = req.userId;
  const { status } = req.body;

  const validStatuses = ["going", "maybe", "not going"];

  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Check if user is an attendee
  db.query(
    `SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?`,
    [eventId, userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length === 0)
        return res.status(403).json({ message: "You are not an attendee of this event" });

      // Update their event status
      db.query(
        `UPDATE event_attendees
         SET status = ?, responded_at = NOW()
         WHERE event_id = ? AND user_id = ?`,
        [status.toLowerCase(), eventId, userId]
      );

      // If going → set user.role = Attendee
      if (status.toLowerCase() === "going") {
        db.query(
          `UPDATE users SET role = 'Attendee' WHERE id = ?`,
          [userId]
        );
      }

      res.json({ message: "Status updated successfully" });
    }
  );
};


// Get attendees for event
// Get attendees for event (with user details)
exports.getAttendees = (req, res) => {
  db.query(
    `SELECT 
      ea.event_id,
      ea.user_id,
      ea.role,
      ea.status,
      ea.invited_by,
      ea.responded_at,
      u.username,
      u.email
    FROM event_attendees ea
    LEFT JOIN users u ON ea.user_id = u.id
    WHERE ea.event_id = ?`,
    [req.params.eventId],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
};
