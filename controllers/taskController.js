const db = require("../db");

// ---------------------
// ADD TASK
// ---------------------
exports.addTask = (req, res) => {
  const { eventId } = req.params;
  const { title, description, due_date, assigned_to } = req.body;

  if (!title || !due_date) {
    return res.status(400).json({ message: "Title and due date are required" });
  }

  const sql = `
    INSERT INTO tasks (event_id, title, description, due_date, assigned_to)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [eventId, title, description, due_date, assigned_to], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error", error: err.code });
    }

    res.json({ message: "Task created", taskId: result.insertId });
  });
};

// ---------------------
// GET TASKS FOR EVENT
// ---------------------
exports.getTasks = (req, res) => {
  const { eventId } = req.params;

  const sql = `SELECT * FROM tasks WHERE event_id = ?`;
  db.query(sql, [eventId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error", error: err.code });
    }
    res.json(rows);
  });
};

// ---------------------
// UPDATE TASK
// ---------------------
exports.updateTask = (req, res) => {
  const { taskId } = req.params;
  const { title, description, due_date, assigned_to, completed } = req.body;

  // Build dynamic query to only update provided fields
  const fields = [];
  const values = [];

  if (title) { fields.push("title=?"); values.push(title); }
  if (description) { fields.push("description=?"); values.push(description); }
  if (due_date) { fields.push("due_date=?"); values.push(due_date); }
  if (assigned_to) { fields.push("assigned_to=?"); values.push(assigned_to); }
  if (completed !== undefined) { fields.push("completed=?"); values.push(completed); }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE task_id=?`;
  values.push(taskId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("UPDATE TASK ERROR:", err); // ← This will show in backend console
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found or no changes made" });
    }
    res.json({ message: "Task updated successfully" });
  });
};

// ---------------------
// DELETE TASK
// ---------------------
exports.deleteTask = (req, res) => {
  const { taskId } = req.params;

  const sql = "DELETE FROM tasks WHERE task_id=?";
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error", error: err.code });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  });
};