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

    const { category } = req.query;

    let query = {
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: skillsWanted },
      skillsWanted: { $in: skillsOffered },
    };

    if (category && category !== 'All') {
      query.skillCategories = { $in: [category] };
    }

    const users = await User.find(query).select("name bio skillsOffered skillsWanted rating totalReviews availabilityStatus skillCategories");

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
        
        const totalPossible = skillsWanted.length + skillsOffered.length;
        const matchPercent = totalPossible === 0 ? 0 : Math.min(Math.round(((offeredOverlap + wantedOverlap) / totalPossible) * 100), 99);

        return {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          rating: user.rating,
          totalReviews: user.totalReviews,
          score,
          matchPercent,
          availabilityStatus: user.availabilityStatus || 'available',
          skillCategories: user.skillCategories || [],
        };
      })
      .sort((a, b) => {
        // Sort by availability first: available > busy > on_leave
        const statusPriority = { available: 3, busy: 2, on_leave: 1 };
        const pA = statusPriority[a.availabilityStatus] || 0;
        const pB = statusPriority[b.availabilityStatus] || 0;
        
        if (pA !== pB) {
          return pB - pA;
        }

        // Fallback to score
        return b.score - a.score;
      });

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };
