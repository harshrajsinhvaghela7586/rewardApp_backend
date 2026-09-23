const Policy = require('../models/Policy');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const cloudinary = require('../config/cloudinary');

// POST /api/admin/users/:userId/policy
exports.uploadPolicy = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'Policy PDF file is required' });

    // Purani policy check karo — delete from Cloudinary
    const existing = await Policy.findOne({ userId });
    if (existing && existing.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(existing.cloudinaryPublicId, { resource_type: 'raw' }).catch(() => {});
      await Policy.findByIdAndDelete(existing._id);
    }

    const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const policy = await Policy.create({
      userId,
      policyNumber,
      policyFileUrl: req.file.path,
      policyFileName: req.file.originalname,
     cloudinaryPublicId:
  req.file.public_id || req.file.filename,
      uploadedBy: req.admin._id,
    });

    await ActivityLog.create({
      action: 'POLICY_UPLOADED',
      description: `Policy uploaded for: ${user.email || user.phone}`,
      performedBy: req.admin._id,
      targetUser: userId,
    });

    res.status(201).json({ success: true, policy });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:userId/policy
exports.getUserPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ userId: req.params.userId });
    if (!policy) return res.status(404).json({ success: false, message: 'No policy found for this user' });
    res.json({ success: true, policy });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:userId/policy
exports.deletePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ userId: req.params.userId });
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

    if (policy.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(policy.cloudinaryPublicId, { resource_type: 'raw' }).catch(() => {});
    }

    await Policy.findByIdAndDelete(policy._id);

    await ActivityLog.create({
      action: 'POLICY_DELETED',
      description: `Policy deleted for userId: ${req.params.userId}`,
      performedBy: req.admin._id,
      targetUser: req.params.userId,
    });

    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (err) {
    next(err);
  }
};
