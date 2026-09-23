const mongoose = require('mongoose');

const scratchCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    isScratched: { type: Boolean, default: false },
    scratchedAt: { type: Date },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScratchCard', scratchCardSchema);
