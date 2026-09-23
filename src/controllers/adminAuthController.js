const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { generateAdminToken } = require('../utils/generateToken');

// POST /api/admin/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Password field select karo (select: false hai schema mein)
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateAdminToken(admin._id);

    await ActivityLog.create({
      action: 'ADMIN_LOGIN',
      description: `Admin logged in: ${admin.email}`,
      performedBy: admin._id,
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, admin: req.admin });
  } catch (err) {
    next(err);
  }
};
