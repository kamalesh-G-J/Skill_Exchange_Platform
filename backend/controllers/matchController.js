const User = require("../models/User");

// GET /api/matches
const getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select(
      "skillsOffered skillsWanted",
    );

    if (!currentUser) {
      res.status(404);
      return next(new Error("User not found"));
    }

    const { skillsOffered, skillsWanted } = currentUser;

    if (!skillsOffered.length || !skillsWanted.length) {
      return res.json({
        success: true,
        message: "Add skills you offer and skills you want to discover matches",
        matches: [],
      });
    }

    const users = await User.find({
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: skillsWanted },
      skillsWanted: { $in: skillsOffered },
    }).select("name bio skillsOffered skillsWanted rating totalReviews");

    const myWantedSet = new Set(skillsWanted);
    const myOfferedSet = new Set(skillsOffered);

    const matches = users
      .map((user) => {
        const offeredOverlap = user.skillsOffered.filter((s) =>
          myWantedSet.has(s),
        ).length;
        const wantedOverlap = user.skillsWanted.filter((s) =>
          myOfferedSet.has(s),
        ).length;
        const score = (offeredOverlap + wantedOverlap) * 10 + user.rating * 2;

        return {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          rating: user.rating,
          totalReviews: user.totalReviews,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };
