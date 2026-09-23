const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { getApplicationStatus } = require('../utils/profileStatus');

// GET /api/user/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const application = getApplicationStatus(user);

    res.json({
      success: true,
      user,
      application,
    });
  } catch (err) {
    next(err);
  }
};


exports.applyReferral = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required',
      });
    }

    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (currentUser.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'Referral code has already been applied',
      });
    }

    const code = referralCode
      .trim()
      .toUpperCase();

    const referrer = await User.findOne({
      referralCode: code,
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code',
      });
    }

    if (
      String(referrer._id) ===
      String(currentUser._id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use your own referral code',
      });
    }

    currentUser.referredBy = referrer._id;
    currentUser.referralPrompted = true;

    await currentUser.save();

    return res.json({
      success: true,
      message: 'Referral code applied successfully',
    });
  } catch (err) {
    next(err);
  }
};

exports.skipReferral = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        referralPrompted: true,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'Referral skipped',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/user/profile
exports.submitProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      dob,
      claimedPrevious,
      hasPreviousPolicy,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeMobile,
    } = req.body;

    const userId = req.user.id;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!dob) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required',
      });
    }

   const claimed =
  claimedPrevious === 'yes'
    ? 'yes'
    : claimedPrevious === 'no'
      ? 'no'
      : null;

if (!claimed) {
  return res.status(400).json({
    success: false,
    message:
      'Please specify whether you have claimed your previous insurance.',
  });
}

const hasPolicy = claimed === 'yes';

const update = {
  name: name.trim(),
  email: email.trim().toLowerCase(),
  dob: new Date(dob),

  claimedPrevious: claimed,
  hasPreviousPolicy: hasPolicy,
};

    // RC
    if (req.files?.rc?.[0]) {
      if (req.user.rcFileUrl) {
        const publicId = req.user.rcFileUrl
          .split('/')
          .slice(-2)
          .join('/')
          .split('.')[0];

        await cloudinary.uploader
          .destroy(publicId, {
            resource_type: 'raw',
          })
          .catch(() => { });
      }

      update.rcFileUrl = req.files.rc[0].path;
      update.rcFileName =
        req.files.rc[0].originalname;
    }

    // Insurance
    if (req.files?.policy?.[0]) {
      if (req.user.previousPolicyUrl) {
        const publicId =
          req.user.previousPolicyUrl
            .split('/')
            .slice(-2)
            .join('/')
            .split('.')[0];

        await cloudinary.uploader
          .destroy(publicId, {
            resource_type: 'raw',
          })
          .catch(() => { });
      }

      update.previousPolicyUrl =
        req.files.policy[0].path;

      update.previousPolicyFileName =
        req.files.policy[0].originalname;
    }

    // If user selected NO, clear old insurance
    if (!hasPolicy) {
      update.previousPolicyUrl = '';
      update.previousPolicyFileName = '';
    }

    // Aadhaar
    // Aadhaar Front
    if (req.files?.aadhaarFront?.[0]) {
      update.aadhaarFrontUrl =
        req.files.aadhaarFront[0].path;

      update.aadhaarFrontFileName =
        req.files.aadhaarFront[0].originalname;
    }

    // Aadhaar Back
    if (req.files?.aadhaarBack?.[0]) {
      update.aadhaarBackUrl =
        req.files.aadhaarBack[0].path;

      update.aadhaarBackFileName =
        req.files.aadhaarBack[0].originalname;
    }

    // PAN
    if (req.files?.pan?.[0]) {
      update.panUrl =
        req.files.pan[0].path;

      update.panFileName =
        req.files.pan[0].originalname;
    }

    // Single nominee only
    update.nomineeName =
      nomineeName?.trim() || '';

    update.nomineeRelationship =
      nomineeRelationship?.trim() || '';

    update.nomineeDob =
      nomineeDob || null;

    update.nomineeMobile =
      nomineeMobile?.trim() || '';

    const user = await User.findByIdAndUpdate(
      userId,
      update,
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const application =
      getApplicationStatus(user);

    return res.json({
      success: true,
      message:
        'Profile submitted successfully. Our representative will contact you shortly.',
      user,
      application,
    });
  } catch (err) {
    next(err);
  }
};


exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};