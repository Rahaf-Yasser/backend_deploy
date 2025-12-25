const db = require("../db");

exports.search = (req, res) => {
  const { keyword, role, start, end } = req.query;

  let sql = `
    SELECT DISTINCT e.*
    FROM events e
    LEFT JOIN tasks t ON e.id = t.event_id
    LEFT JOIN event_attendees a ON e.id = a.event_id
    WHERE 1 = 1
  `;
  let params = [];

  if (keyword) {
    sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR t.description LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (role) {
    sql += ` AND a.role = ?`;
    params.push(role);
  }

  if (start) {
    sql += ` AND e.start_datetime >= ?`;
    params.push(start);
  }

  if (end) {
    sql += ` AND e.end_datetime <= ?`;
    params.push(end);
  }

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
};
