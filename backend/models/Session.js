const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    exchangeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 60 },
    meetLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    reviewedByHost: { type: Boolean, default: false },
    reviewedByGuest: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sessionSchema.index({ exchangeId: 1 });
sessionSchema.index({ hostId: 1, status: 1 });
sessionSchema.index({ guestId: 1, status: 1 });

module.exports = mongoose.model("Session", sessionSchema);
