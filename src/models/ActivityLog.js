const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'POLICY_UPLOADED',
        'POLICY_DELETED',
        'SCRATCH_CARD_ISSUED',
        'SCRATCH_CARD_REDEEMED',
        'ADMIN_LOGIN',
        'OTP_SENT',
        'OTP_VERIFIED',
      ],
      required: true,
    },
    description: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
