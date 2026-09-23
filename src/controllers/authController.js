const OTP = require('../models/OTP');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateOTP, sendOTPviaSMS, sendOTPviaWhatsApp } = require('../utils/sendOTP');
const { generateToken } = require('../utils/generateToken');
const { env } = require('../config/env');
const { getApplicationStatus } = require('../utils/profileStatus');
const generateReferralCode = require('../utils/generateReferralCode');

// POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, via = 'sms' } = req.body;

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + env.otp.expiresIn * 60 * 1000);

    await OTP.findOneAndDelete({ phone });
    await OTP.create({ phone, otp, expiresAt });

    if (via === 'whatsapp') {
      await sendOTPviaWhatsApp(phone, otp);
    } else {
      await sendOTPviaSMS(phone, otp);
    }

    res.json({
      success: true,
      message: `OTP sent via ${via === 'whatsapp' ? 'WhatsApp' : 'SMS'}`,
      via,
      // Dev mein OTP dikhao, production mein nahi
      ...(env.isDev && { otp }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { phone, via = 'sms' } = req.body;

    const existing = await OTP.findOne({ phone });
    if (existing && existing.resendCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 15 minutes.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + env.otp.expiresIn * 60 * 1000);

    await OTP.findOneAndUpdate(
      { phone },
      { otp, expiresAt, $inc: { resendCount: 1 } },
      { upsert: true, new: true }
    );

    if (via === 'whatsapp') {
      await sendOTPviaWhatsApp(phone, otp);
    } else {
      await sendOTPviaSMS(phone, otp);
    }

    res.json({
      success: true,
      message: `OTP resent via ${via === 'whatsapp' ? 'WhatsApp' : 'SMS'}`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const record = await OTP.findOne({ phone });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
    }

    if (record.expiresAt < new Date()) {
      await OTP.findOneAndDelete({ phone });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    await OTP.findOneAndDelete({ phone });

    let user = await User.findOne({ phone });
    const isNewUser = !user;
const generateUniqueReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateReferralCode();
    exists = await User.exists({ referralCode: code });
  }

  return code;
};
    if (!user) {
      const referralCode = await generateUniqueReferralCode();

 user = await User.create({
  phone,
  isVerified: true,
  referralCode,
});
    } else {
      user.isVerified = true;
      await user.save();
    }
    const application =
  getApplicationStatus(user);

const isFirstTime =
  !user.rcFileUrl &&
  !user.previousPolicyUrl &&
  !user.aadhaarUrl &&
  !user.panUrl &&
  !user.name &&
  !user.email;

const token =
  generateToken(user._id);

await ActivityLog.create({
  action: 'OTP_VERIFIED',
  description: `OTP verified for phone: ${phone}`,
  targetUser: user._id,
});

res.json({
  success: true,
  message: 'OTP verified successfully',
  token,

  user: {
    id: user._id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    isNewUser,
    isProfileComplete:
      application.isComplete,
  },

  application: {
    ...application,
    isFirstTime,
  },
});
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/guest-login
exports.guestLogin = async (req, res, next) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, isGuest: true });
    }
 const application = getApplicationStatus(user);

    const token = generateToken(user._id);

   
    res.json({
      success: true,
      message: 'Guest login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        isGuest: true,
        isProfileComplete: application.isComplete,
      },
      application,
    });
  }
  catch (err) {
    next(err);
  }
};
