const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "" },
    skillsOffered: [{ type: String, trim: true }],
    skillsWanted: [{ type: String, trim: true }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

userSchema.index({ skillsOffered: 1 });
userSchema.index({ skillsWanted: 1 });

module.exports = mongoose.model("User", userSchema);
