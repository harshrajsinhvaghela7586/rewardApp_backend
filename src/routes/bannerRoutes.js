const express = require('express');

const {
  adminProtect,
  superAdminOnly,
} = require('../middlewares/adminAuthMiddleware');

const bannerController = require('../controllers/bannerController');
const bannerUpload = require('../middlewares/bannerUpload');

const router = express.Router();

/* ================================================= */
/* PUBLIC */
/* ================================================= */

// Mobile app
router.get(
  '/',
  bannerController.getActiveBanners
);

/* ================================================= */
/* ADMIN */
/* ================================================= */

// Get all banners
router.get(
  '/admin',
  adminProtect,
  bannerController.getAllBanners
);

// Create banner
router.post(
  '/',
  adminProtect,
  bannerUpload.single('image'),
  bannerController.createBanner
);

// Update banner
router.put(
  '/:id',
  adminProtect,
  bannerUpload.single('image'),
  bannerController.updateBanner
);

// Activate / deactivate
router.patch(
  '/:id/toggle',
  adminProtect,
  bannerController.toggleBanner
);

// Delete banner
router.delete(
  '/:id',
  adminProtect,
  bannerController.deleteBanner
);

module.exports = router;