const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema(
  {
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredSkill: { type: String, required: true },
    wantedSkill: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
    message: { type: String, default: "" },
    matchScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

exchangeRequestSchema.index({ initiatorId: 1, status: 1 });
exchangeRequestSchema.index({ receiverId: 1, status: 1 });

module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
