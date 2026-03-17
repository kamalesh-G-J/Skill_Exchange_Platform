const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createRequest,
  getIncoming,
  getOutgoing,
  acceptRequest,
  declineRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.use(protect);

router.post("/", createRequest);
router.get("/incoming", getIncoming);
router.get("/outgoing", getOutgoing);
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/decline", declineRequest);

module.exports = router;
