const express = require('express');
const {
  recordPayment,
  getPayments,
  deletePayment
} = require('../controllers/feePaymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('student', 'owner', 'admin'), recordPayment);

router.route('/owner')
  .get(authorize('owner', 'admin'), getPayments);

router.route('/:id')
  .delete(authorize('owner', 'admin'), deletePayment);

module.exports = router;
