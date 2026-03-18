const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createReview,
  getUserReviews,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/reviews", protect, createReview);
router.get("/users/:id/reviews", getUserReviews);

module.exports = router;
