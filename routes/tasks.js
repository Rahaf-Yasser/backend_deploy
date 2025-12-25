const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  addTask,
  getTasks,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// Add task
router.post("/:eventId/tasks", auth, addTask);

// Get tasks
router.get("/:eventId/tasks", auth, getTasks);

// Update task
router.put("/:taskId", auth, updateTask);

// Delete task
router.delete("/:taskId", auth, deleteTask);

module.exports = router;
