const mongoose = require("mongoose");
const Review = require("../models/Review");
const Session = require("../models/Session");
const User = require("../models/User");

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { sessionId, revieweeId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // --- validate session exists and is completed ---
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404);
      return next(new Error("Session not found"));
    }
    if (session.status !== "completed") {
      res.status(400);
      return next(new Error("Cannot review a session that is not completed"));
    }

    // reviewer must be a participant
    const isHost = session.hostId.toString() === reviewerId;
    const isGuest = session.guestId.toString() === reviewerId;
    if (!isHost && !isGuest) {
      res.status(403);
      return next(new Error("You are not a participant of this session"));
    }

    // --- check duplicate review ---
    const existing = await Review.findOne({ sessionId, reviewerId });
    if (existing) {
      res.status(400);
      return next(new Error("You have already reviewed this session"));
    }

    // --- create review ---
    const review = await Review.create({
      sessionId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    });

    // mark reviewed flag on session
    if (isHost) {
      session.reviewedByHost = true;
    } else {
      session.reviewedByGuest = true;
    }
    await session.save();

    // --- recalculate reviewee rating via aggregation ---
    const [stats] = await Review.aggregate([
      { $match: { revieweeId: new mongoose.Types.ObjectId(revieweeId) } },
      {
        $group: {
          _id: "$revieweeId",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats) {
      await User.findByIdAndUpdate(revieweeId, {
        rating: Math.round(stats.avg * 10) / 10,
        totalReviews: stats.count,
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/reviews
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.id })
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getUserReviews };
