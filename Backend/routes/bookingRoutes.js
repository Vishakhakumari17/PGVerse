const express = require('express');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingPaymentStatus,
  getNotifications,
  markNotificationsRead,
  getOwnerAnalytics,
  getAdminAnalytics
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Booking CRUD
router.route('/')
  .post(protect, authorize('student'), createBooking)
  .get(protect, getBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);
router.put('/:id/payment-status', protect, authorize('owner', 'admin'), updateBookingPaymentStatus);

// Notifications
router.get('/notifications/all', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

// Analytics
router.get('/analytics/owner', protect, authorize('owner'), getOwnerAnalytics);
router.get('/analytics/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
