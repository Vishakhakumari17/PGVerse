const express = require('express');
const {
  purchasePlan,
  getOwnerSubscription,
  getAllSubscriptions,
  approveSubscription,
  extendSubscription,
  cancelSubscription,
  getSubscriptionStats
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Owner operations
router.route('/')
  .post(protect, authorize('owner'), purchasePlan);

router.get('/owner', protect, authorize('owner'), getOwnerSubscription);

// Admin operations
router.get('/', protect, authorize('admin'), getAllSubscriptions);
router.get('/admin/stats', protect, authorize('admin'), getSubscriptionStats);

router.put('/:id/approve', protect, authorize('admin'), approveSubscription);
router.put('/:id/extend', protect, authorize('admin'), extendSubscription);
router.put('/:id/cancel', protect, authorize('admin'), cancelSubscription);

module.exports = router;
