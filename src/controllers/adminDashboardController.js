const User = require('../models/User');
const Policy = require('../models/Policy');
const ScratchCard = require('../models/ScratchCard');
const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      scratchCardsIssued,
      totalPolicies,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      ScratchCard.countDocuments(),
      Policy.countDocuments(),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('performedBy', 'name role')
        .populate('targetUser', 'email name phone'),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        scratchCardsIssued,
        totalPolicies,
      },
      recentActivity,
      lastRefreshed: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
