const router = require('express').Router();
const { adminProtect, superAdminOnly } = require('../middlewares/adminAuthMiddleware');
const { uploadPolicy } = require('../middlewares/uploadMiddleware');
const { validate, schemas } = require('../middlewares/validate');

const adminAuthController       = require('../controllers/adminAuthController');
const adminUserController       = require('../controllers/adminUserController');
const adminPolicyController     = require('../controllers/adminPolicyController');
const adminScratchCardController= require('../controllers/adminScratchCardController');
const adminDashboardController  = require('../controllers/adminDashboardController');

// ── Auth (public) ──────────────────────────────────────────────
router.post('/login', validate(schemas.adminLogin), adminAuthController.login);

// ── Below this — Admin JWT required ───────────────────────────
router.use(adminProtect);

router.get('/me', adminAuthController.getMe);

// ── Dashboard ──────────────────────────────────────────────────
router.get('/dashboard', adminDashboardController.getDashboard);

// ── Users CRUD ─────────────────────────────────────────────────
router.get('/users',     adminUserController.getAllUsers);
router.get('/users/:id', adminUserController.getUserById);
router.post('/users',    validate(schemas.createUser), adminUserController.createUser);
router.put('/users/:id', validate(schemas.updateUser), adminUserController.updateUser);
router.delete('/users/:id', superAdminOnly, adminUserController.deleteUser);

// ── Policy ─────────────────────────────────────────────────────
router.get('/users/:userId/policy',    adminPolicyController.getUserPolicy);
router.post('/users/:userId/policy',   uploadPolicy, adminPolicyController.uploadPolicy);
router.delete('/users/:userId/policy', adminPolicyController.deletePolicy);

// ── Scratch Card / Reward ──────────────────────────────────────
router.get('/users/:userId/scratch-cards',  adminScratchCardController.getUserCards);
router.post(
  '/users/:userId/scratch-card',
  validate(schemas.issueReward),
  adminScratchCardController.issueReward
);

module.exports = router;
