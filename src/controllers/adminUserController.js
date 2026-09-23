const User = require('../models/User');
const Policy = require('../models/Policy');
const ScratchCard = require('../models/ScratchCard');
const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/users?page=1&limit=10&search=sparsh&status=active
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-__v');

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const policy = await Policy.findOne({ userId: user._id });
    const scratchCards = await ScratchCard.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({ success: true, user, policy, scratchCards });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, status } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    const user = await User.create({ name, email, phone, status, isVerified: true });

    await ActivityLog.create({
      action: 'USER_CREATED',
      description: `User created: ${email}`,
      performedBy: req.admin._id,
      targetUser: user._id,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, status, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, role },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await ActivityLog.create({
      action: 'USER_UPDATED',
      description: `Updated details for: ${user.email}`,
      performedBy: req.admin._id,
      targetUser: user._id,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Related data bhi delete karo
    await Policy.findOneAndDelete({ userId: user._id });
    await ScratchCard.deleteMany({ userId: user._id });

    await ActivityLog.create({
      action: 'USER_DELETED',
      description: `Deleted user: ${user.email || user.phone}`,
      performedBy: req.admin._id,
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
