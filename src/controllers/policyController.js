const Policy = require('../models/Policy');
const ScratchCard = require('../models/ScratchCard');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// GET /api/policy/my-policy
exports.getMyPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ userId: req.user.id, isActive: true });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not yet uploaded. Please wait for admin to upload your policy.',
      });
    }

    res.json({ success: true, policy });
  } catch (err) {
    next(err);
  }
};

// GET /api/policy/my-scratch-card
exports.getMyScratchCard = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');

    // Latest card — scratched ho ya unsctratched, dono milega
    const card = await ScratchCard.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'No scratch card available',
      });
    }

    return res.status(200).json({
      success: true,
      card: {
        id: card._id,
        amount: card.amount,
        currency: card.currency,

        // Important
        isIssued: true,
        isScratched: card.isScratched,

        createdAt: card.createdAt,
        issuedAt: card.createdAt,

        scratchedAt: card.scratchedAt || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/policy/scratch
exports.scratchCard = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');

    const card = await ScratchCard.findOne({
      userId: req.user.id,
      isScratched: false,
    }).sort({ createdAt: -1 });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'No scratch card available',
      });
    }

    card.isScratched = true;
    card.scratchedAt = new Date();

    await card.save();

    await ActivityLog.create({
      action: 'SCRATCH_CARD_REDEEMED',
      description: `User redeemed ₹${card.amount} scratch card`,
      targetUser: req.user.id,
    });

    return res.status(200).json({
      success: true,
      card: {
        id: card._id,
        amount: card.amount,
        currency: card.currency,
        isScratched: true,
        scratchedAt: card.scratchedAt,
      },
      amount: card.amount,
      currency: card.currency,
      message: `🎉 Congratulations! You won ₹${card.amount} cashback!`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/policy/my-scratch-cards
// Get all scratch card history
// GET /api/policy/scratch-history
exports.myScratchCardHistory = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');

    const cards = await ScratchCard.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select(
        '_id amount currency isScratched scratchedAt createdAt issuedBy'
      );

    return res.status(200).json({
      success: true,
      cards,
      count: cards.length,
    });
  } catch (err) {
    next(err);
  }
};

// policyController.js
exports.downloadMyPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ user: req.user._id });
    if (!policy?.policyFileUrl) {
      return res.status(404).json({ message: 'Policy document not found' });
    }

    const upstream = await fetch(policy.policyFileUrl);
    if (!upstream.ok) {
      return res.status(502).json({ message: 'Unable to fetch document' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Policy-${policy.policyNumber || 'document'}.pdf"`
    );

    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    next(err);
  }
};