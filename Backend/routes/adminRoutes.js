const express = require('express');
const {
  getUsersList,
  createUser,
  updateUserStatus,
  deleteUser,
  createComplaint,
  getComplaints,
  resolveComplaint,
  createContactRequest,
  getContactRequests,
  assignOwnersToRequest,
  ownerActionOnRequest,
  getOwnerAssignedRequests,
  checkContactRequestStatus,
  getAdminStats,
  createContactMessage,
  getContactMessages
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Stats (Admin)
router.get('/stats', protect, authorize('admin'), getAdminStats);

// User CRUD (Admin & Owner)
router.route('/users')
  .get(protect, authorize('admin', 'owner'), getUsersList)
  .post(protect, authorize('admin', 'owner'), createUser);

router.route('/users/:id')
  .delete(protect, authorize('admin', 'owner'), deleteUser);

router.put('/users/:id/status', protect, authorize('admin', 'owner'), updateUserStatus);

// Complaints System
router.route('/complaints')
  .post(protect, authorize('student'), createComplaint)
  .get(protect, getComplaints);

router.put('/complaints/:id/resolve', protect, authorize('admin'), resolveComplaint);

// Contact Request matching
router.route('/contact-requests')
  .post(protect, authorize('student'), createContactRequest)
  .get(protect, getContactRequests);

router.get('/contact-requests/owner', protect, authorize('owner'), getOwnerAssignedRequests);
router.get('/contact-requests/check/:pgId', protect, authorize('student'), checkContactRequestStatus);
router.put('/contact-requests/:id/assign', protect, authorize('admin'), assignOwnersToRequest);
router.put('/contact-requests/:id/owner-action', protect, authorize('owner'), ownerActionOnRequest);

// Contact Form Messages
router.post('/contact-messages', createContactMessage);
router.get('/contact-messages', protect, authorize('admin'), getContactMessages);

module.exports = router;
