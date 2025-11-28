const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { search } = require("../controllers/searchController");

// Search events
router.get("/", auth, search);

module.exports = router;
