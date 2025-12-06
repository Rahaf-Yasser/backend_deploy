const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

// Get my invitations
router.get("/my", auth, (req, res) => {
  const userId = req.userId;
  
  db.query(
    `SELECT 
      e.id as event_id,
      e.title,
      e.start_datetime,
      e.location,
      ea.status,
      ea.role
    FROM event_attendees ea
    JOIN events e ON ea.event_id = e.id
    WHERE ea.user_id = ? AND ea.status = 'invited'`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

module.exports = router;