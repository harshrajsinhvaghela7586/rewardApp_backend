const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { env } = require('../config/env');

const adminProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account is deactivated' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
};

// Sirf super_admin access
const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  next();
};

module.exports = { adminProtect, superAdminOnly };
