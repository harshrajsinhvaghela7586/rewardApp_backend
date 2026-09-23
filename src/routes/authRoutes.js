const router = require('express').Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middlewares/validate');

router.post('/send-otp',   validate(schemas.sendOTP),   authController.sendOTP);
router.post('/resend-otp', validate(schemas.sendOTP),   authController.resendOTP);
router.post('/verify-otp', validate(schemas.verifyOTP), authController.verifyOTP);
router.post('/guest-login',validate(schemas.guestLogin),authController.guestLogin);

module.exports = router;
