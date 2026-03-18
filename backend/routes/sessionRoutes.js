const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getMySessions,
  scheduleSession,
  completeSession,
} = require("../controllers/sessionController");

const router = express.Router();

router.use(protect);

router.get("/mine", getMySessions);
router.patch("/:id/schedule", scheduleSession);
router.patch("/:id/complete", completeSession);

module.exports = router;
