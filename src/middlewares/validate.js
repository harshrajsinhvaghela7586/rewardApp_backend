const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }
  next();
};

// ── Auth Schemas ──────────────────────────────────
const sendOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Enter a valid 10-digit phone number',
    'any.required': 'Phone number is required',
  }),
  via: Joi.string().valid('sms', 'whatsapp').default('sms'),
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must be numeric',
  }),
});

const guestLoginSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
});

// ── Profile Schema ────────────────────────────────
const profileSchema = Joi.object({
  name: Joi.string().pattern(/^[A-Za-z .'-]{2,60}$/).required().messages({
    'string.pattern.base': 'Name can contain letters, spaces, apostrophes and dots only',
  }),
  email: Joi.string().email().required(),
  dob: Joi.date().max('now').required(),
  claimedPrevious: Joi.string().valid('yes', 'no').required(),
  hasPreviousPolicy: Joi.boolean().required(),
  vehicleDetails: Joi.string().max(500).allow('', null),
  nomineeName: Joi.string().pattern(/^[A-Za-z .'-]{2,60}$/).allow('', null),
  nomineeRelationship: Joi.string().max(50).allow('', null),
  nomineeDob: Joi.string().max(20).allow('', null),
  nomineeMobile: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
});

// ── Admin Schemas ─────────────────────────────────
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  status: Joi.string().valid('active', 'inactive', 'blocked').default('active'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  status: Joi.string().valid('active', 'inactive', 'blocked'),
  role: Joi.string().valid('user'),
});

const issueRewardSchema = Joi.object({
  amount: Joi.number().min(1).max(100000).required().messages({
    'number.min': 'Amount must be at least 1',
    'number.max': 'Amount cannot exceed 1,00,000',
    'any.required': 'Reward amount is required',
  }),
  currency: Joi.string().valid('INR').default('INR'),
});

module.exports = {
  validate,
  schemas: {
    sendOTP: sendOTPSchema,
    verifyOTP: verifyOTPSchema,
    guestLogin: guestLoginSchema,
    profile: profileSchema,
    adminLogin: adminLoginSchema,
    createUser: createUserSchema,
    updateUser: updateUserSchema,
    issueReward: issueRewardSchema,
  },
};
