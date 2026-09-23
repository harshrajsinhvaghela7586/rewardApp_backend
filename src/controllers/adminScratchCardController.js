const ScratchCard = require('../models/ScratchCard');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// POST /api/admin/users/:userId/scratch-card
exports.issueReward = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount, currency = 'INR' } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.status === 'blocked') {
      return res.status(400).json({ success: false, message: 'Cannot issue reward to a blocked user' });
    }

    const card = await ScratchCard.create({
      userId,
      amount,
      currency,
      issuedBy: req.admin._id,
    });

    await ActivityLog.create({
      action: 'SCRATCH_CARD_ISSUED',
      description: `Generated ₹${amount} card for ${user.email || user.phone} (Email & SMS)`,
      performedBy: req.admin._id,
      targetUser: userId,
    });

    res.status(201).json({
      success: true,
      message: `₹${amount} scratch card issued to ${user.email || user.phone}`,
      card,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:userId/scratch-cards
exports.getUserCards = async (req, res, next) => {
  try {
    const cards = await ScratchCard.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('issuedBy', 'name email');

    const totalIssued = cards.length;
    const totalAmount = cards.reduce((sum, c) => sum + c.amount, 0);
    const totalRedeemed = cards.filter((c) => c.isScratched).length;

    res.json({
      success: true,
      cards,
      stats: { totalIssued, totalAmount, totalRedeemed },
    });
  } catch (err) {
    next(err);
  }
};
