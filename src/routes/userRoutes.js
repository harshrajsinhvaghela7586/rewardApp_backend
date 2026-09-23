const router = require('express').Router();

const { protect } =
  require('../middlewares/authMiddleware');

const {
  uploadDocuments,
} = require('../middlewares/uploadMiddleware');

const {
  validate,
  schemas,
} = require('../middlewares/validate');

const userController =
  require('../controllers/userController');

router.get(
  '/me',
  protect,
  userController.getMe
);

router.post(
  '/apply-referral',
  protect,
  userController.applyReferral
);
router.post(
  '/skip-referral',
  protect,
  userController.skipReferral
);
router.post(
  '/profile',
  protect,
  uploadDocuments,
  validate(schemas.profile),
  userController.submitProfile
);

router.patch(
  '/profile',
  protect,
  userController.updateProfile
);

module.exports = router;