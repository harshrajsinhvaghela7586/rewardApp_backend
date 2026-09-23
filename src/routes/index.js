const router = require('express').Router();

const authRoutes   = require('./authRoutes');
const userRoutes   = require('./userRoutes');
const policyRoutes = require('./policyRoutes');
const adminRoutes  = require('./adminRoutes');
const bannerRoutes = require('./bannerRoutes');

// ── Mount all routes ───────────────────────────────────────────
router.use('/auth',   authRoutes);    // /api/auth/*
router.use('/user',   userRoutes);    // /api/user/*
router.use('/policy', policyRoutes);  // /api/policy/*
router.use('/admin',  adminRoutes);   // /api/admin/*
router.use('/banners', bannerRoutes); // /api/banners/*
module.exports = router;