const ExchangeRequest = require("../models/ExchangeRequest");
const Session = require("../models/Session");

// POST /api/requests
const createRequest = async (req, res, next) => {
  try {
    const { receiverId, offeredSkill, wantedSkill, message, matchScore } =
      req.body;

    if (!receiverId || !offeredSkill || !wantedSkill) {
      res.status(400);
      return next(
        new Error("receiverId, offeredSkill, and wantedSkill are required"),
      );
    }

    if (receiverId === req.user.id) {
      res.status(400);
      return next(new Error("Cannot send a request to yourself"));
    }

    const existing = await ExchangeRequest.findOne({
      initiatorId: req.user.id,
      receiverId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      res.status(400);
      return next(
        new Error("You already have an active request with this user"),
      );
    }

    const request = await ExchangeRequest.create({
      initiatorId: req.user.id,
      receiverId,
      offeredSkill,
      wantedSkill,
      message,
      matchScore,
      status: "pending",
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/incoming
const getIncoming = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ receiverId: req.user.id })
      .populate("initiatorId", "name skillsOffered rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/outgoing
const getOutgoing = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ initiatorId: req.user.id })
      .populate("receiverId", "name skillsWanted rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/requests/:id/accept
const acceptRequest = async (req, res, next) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      return next(new Error("Request not found"));
    }

    if (request.receiverId.toString() !== req.user.id) {
      res.status(403);
      return next(new Error("Only the receiver can accept this request"));
    }

    if (request.status !== "pending") {
      res.status(400);
      return next(new Error(`Request already ${request.status}`));
    }

    request.status = "accepted";
    await request.save();

    const session = await Session.create({
      exchangeId: request._id,
      hostId: request.initiatorId,
      guestId: request.receiverId,
      scheduledAt:
        req.body.scheduledAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "scheduled",
    });

    res.json({ success: true, request, session });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/requests/:id/decline
const declineRequest = async (req, res, next) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      return next(new Error("Request not found"));
    }

    if (request.receiverId.toString() !== req.user.id) {
      res.status(403);
      return next(new Error("Only the receiver can decline this request"));
    }

    if (request.status !== "pending") {
      res.status(400);
      return next(new Error(`Request already ${request.status}`));
    }

    request.status = "declined";
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getIncoming,
  getOutgoing,
  acceptRequest,
  declineRequest,
};
