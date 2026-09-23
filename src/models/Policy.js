const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // ek user ka ek hi active policy
    },
    policyNumber: { type: String, unique: true },
    insurer: {
      type: String,
      enum: ['ICICI', 'HDFC', 'Bajaj', 'Acko', 'Other'],
      default: 'Other',
    },
    policyFileUrl: { type: String, required: true },
    policyFileName: { type: String },
    cloudinaryPublicId: { type: String }, // delete ke liye
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
