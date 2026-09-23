const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const generateToken = (userId, expiresIn = env.jwt.expiresIn) => {
  return jwt.sign(
    { id: userId },
    env.jwt.secret,
    { expiresIn }
  );
};

const generateAdminToken = (adminId) => {
  const expiresIn =
    env.jwt.adminExpiresIn ||
    env.jwt.expiresIn ||
    process.env.JWT_EXPIRES_IN ||
    '7d';

  return jwt.sign(
    { id: adminId },
    env.jwt.secret,
    { expiresIn }
  );
};

module.exports = {
  generateToken,
  generateAdminToken,
};