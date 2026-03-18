const express = require("express");
const { protect } = require("../middleware/auth");
const { getMatches } = require("../controllers/matchController");

const router = express.Router();

// GET /api/matches — find mutual-skill users, scored & sorted
router.get("/", protect, getMatches);

module.exports = router;
