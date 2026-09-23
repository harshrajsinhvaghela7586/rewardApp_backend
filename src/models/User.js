const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    vehicleDetails: { type: String, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    dob: { type: Date },
    isGuest: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    role: { type: String, enum: ['user'], default: 'user' },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    referralPrompted: {
      type: Boolean,
      default: false,
    },

    rcFileUrl: { type: String },
    rcFileName: { type: String },
    previousPolicyUrl: { type: String },
    previousPolicyFileName: { type: String },
    aadhaarFrontUrl: {
      type: String,
    },

    aadhaarFrontFileName: {
      type: String,
    },

    aadhaarBackUrl: {
      type: String,
    },

    aadhaarBackFileName: {
      type: String,
    },

    panUrl: {
      type: String,
    },

    panFileName: {
      type: String,
    },
    panUrl: { type: String },
    panFileName: { type: String },
    nomineeName: { type: String, trim: true },
    nomineeRelationship: { type: String, trim: true },
    nomineeDob: { type: String, trim: true },
    nomineeMobile: { type: String, trim: true },
    hasPreviousPolicy: { type: Boolean, default: true },
    claimedPrevious: { type: String, enum: ['yes', 'no'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
