require('dotenv').config();

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'OTP_API_KEY',           // ye pehle se tha
  'OTP_SMS_TEMPLATE',      // naya
  'OTP_WHATSAPP_TEMPLATE', // naya
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

// Startup pe check karo — koi bhi missing ho toh server band
const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ All environment variables loaded');
};

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  mongo: {
    uri: process.env.MONGO_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

 otp: {
    apiKey: process.env.OTP_API_KEY,
    smsTemplate: process.env.OTP_SMS_TEMPLATE || 'OTP1',
    whatsappTemplate: process.env.OTP_WHATSAPP_TEMPLATE || 'OTP1',
    expiresIn: parseInt(process.env.OTP_EXPIRES_IN) || 5, // minutes
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = { env, validateEnv };