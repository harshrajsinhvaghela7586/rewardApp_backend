const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const policyController = require('../controllers/policyController');

router.get('/my-policy',        protect, policyController.getMyPolicy);
router.get('/my-scratch-card',  protect, policyController.getMyScratchCard);
router.post('/scratch',         protect, policyController.scratchCard);
router.get('/scratch-history',  protect, policyController.myScratchCardHistory);
router.get('/my-policy/download', protect, policyController.downloadMyPolicy);
module.exports = router;
