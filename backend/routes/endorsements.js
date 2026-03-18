const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/endorsements
// @desc    Endorse a user's skill
// @access  Private
router.post('/', protect, async (req, res) => {
  const { targetUserId, skill } = req.body;

  if (!targetUserId || !skill) {
    return res.status(400).json({ message: 'Target user ID and skill are required' });
  }

  if (targetUserId === req.user.id) {
    return res.status(400).json({ message: 'You cannot endorse yourself' });
  }

  try {
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.skillsOffered.includes(skill)) {
      return res.status(400).json({ message: 'User does not offer this skill' });
    }

    // Find if the skill is already in the endorsements array
    let endorsementRecord = targetUser.endorsements.find((e) => e.skill === skill);

    if (!endorsementRecord) {
      // If the skill doesn't exist in the endorsements array, add it
      targetUser.endorsements.push({
        skill,
        endorsedBy: [],
      });
      endorsementRecord = targetUser.endorsements.find((e) => e.skill === skill);
    }

    // Check if the current user has already endorsed this skill
    const alreadyEndorsed = endorsementRecord.endorsedBy.some(
      (endorsement) => endorsement.userId.toString() === req.user.id
    );

    if (alreadyEndorsed) {
      return res.status(400).json({ message: 'You have already endorsed this skill' });
    }

    // Add the endorsement
    endorsementRecord.endorsedBy.push({
      userId: req.user.id,
      endorsedAt: Date.now(),
    });

    await targetUser.save();

    res.status(200).json({ message: 'Skill endorsed successfully', endorsements: targetUser.endorsements });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/endorsements
// @desc    Remove an endorsement for a user's skill
// @access  Private
router.delete('/', protect, async (req, res) => {
  const { targetUserId, skill } = req.body;

  if (!targetUserId || !skill) {
    return res.status(400).json({ message: 'Target user ID and skill are required' });
  }

  try {
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the skill endorsement record
    const endorsementRecord = targetUser.endorsements.find((e) => e.skill === skill);

    if (!endorsementRecord) {
      return res.status(400).json({ message: 'Skill has no endorsements' });
    }

    // Check if the user has actually endorsed this skill
    const hasEndorsed = endorsementRecord.endorsedBy.some(
      (endorsement) => endorsement.userId.toString() === req.user.id
    );

    if (!hasEndorsed) {
      return res.status(400).json({ message: 'You have not endorsed this skill' });
    }

    // Remove the endorsement
    endorsementRecord.endorsedBy = endorsementRecord.endorsedBy.filter(
      (endorsement) => endorsement.userId.toString() !== req.user.id
    );

    await targetUser.save();

    res.status(200).json({ message: 'Endorsement removed successfully', endorsements: targetUser.endorsements });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
