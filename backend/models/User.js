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
    skillCategories: [
      {
        skill: { type: String, required: true },
        category: {
          type: String,
          enum: [
            "Tech",
            "Music",
            "Language",
            "Design",
            "Fitness",
            "Finance",
            "Arts",
            "Cooking",
            "Science",
            "Business",
          ],
          required: true
        },
      },
    ],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "on_leave"],
      default: "available",
    },
    endorsements: [
      {
        skill: { type: String, required: true },
        endorsedBy: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            endorsedAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

userSchema.index({ skillsOffered: 1 });
userSchema.index({ skillsWanted: 1 });

module.exports = mongoose.model("User", userSchema);
