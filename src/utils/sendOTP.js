const axios = require('axios');
const { env } = require('../config/env');

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPviaSMS = async (phone, otp) => {
  try {
    const url = `https://2factor.in/API/V1/${env.otp.apiKey}/SMS/${phone}/${otp}/${env.otp.smsTemplate}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.Status !== 'Success') {
      throw new Error(`SMS failed: ${response.data.Details}`);
    }

    console.log(`✅ SMS OTP sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('❌ SMS OTP error:', err.message);
    throw new Error('Failed to send SMS OTP. Please try again.');
  }
};

const sendOTPviaWhatsApp = async (phone, otp) => {
  try {
    const url = `https://2factor.in/API/V1/${env.otp.apiKey}/WHATSAPP/${phone}/${otp}/${env.otp.whatsappTemplate}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.Status !== 'Success') {
      throw new Error(`WhatsApp failed: ${response.data.Details}`);
    }

    console.log(`✅ WhatsApp OTP sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp OTP error:', err.message);
    // WhatsApp fail ho toh SMS fallback
    console.log('⚠️  Falling back to SMS...');
    return await sendOTPviaSMS(phone, otp);
  }
};

module.exports = { generateOTP, sendOTPviaSMS, sendOTPviaWhatsApp };
