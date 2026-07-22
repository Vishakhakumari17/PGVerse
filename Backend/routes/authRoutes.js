const express = require('express');
const {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  adminFirebaseLogin,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-firebase-login', adminFirebaseLogin);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
