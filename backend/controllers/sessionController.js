const Session = require("../models/Session");

// GET /api/sessions/mine
const getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      $or: [{ hostId: req.user.id }, { guestId: req.user.id }],
    })
      .populate("hostId", "name email rating")
      .populate("guestId", "name email rating")
      .populate("exchangeId", "offeredSkill wantedSkill")
      .sort({ scheduledAt: -1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/sessions/:id/schedule
const scheduleSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      return next(new Error("Session not found"));
    }

    const userId = req.user.id;
    if (
      session.hostId.toString() !== userId &&
      session.guestId.toString() !== userId
    ) {
      res.status(403);
      return next(new Error("Not authorized to update this session"));
    }

    if (!req.body.scheduledAt) {
      res.status(400);
      return next(new Error("scheduledAt is required"));
    }

    session.scheduledAt = req.body.scheduledAt;
    if (req.body.meetLink) session.meetLink = req.body.meetLink;
    if (req.body.durationMins) session.durationMins = req.body.durationMins;
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/sessions/:id/complete
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      return next(new Error("Session not found"));
    }

    const userId = req.user.id;
    const isHost = session.hostId.toString() === userId;
    const isGuest = session.guestId.toString() === userId;

    if (!isHost && !isGuest) {
      res.status(403);
      return next(new Error("Not authorized to update this session"));
    }

    session.status = "completed";
    if (isHost) session.reviewedByHost = true;
    if (isGuest) session.reviewedByGuest = true;
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMySessions, scheduleSession, completeSession };
