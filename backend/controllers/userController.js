const User = require("../models/User");

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const { name, bio, skillsOffered, skillsWanted, availabilityStatus, skillCategories } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
    if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
    if (skillCategories !== undefined) user.skillCategories = skillCategories;

    await user.save();

    const updated = user.toObject();
    delete updated.passwordHash;
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe };
