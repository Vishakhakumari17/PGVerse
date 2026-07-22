const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// Helper to sign JWT
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pgverse_jwt_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register user (Immediate verification for local testing)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (isVerified automatically true for easy local testing)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      isVerified: true,
      otp: null,
      otpExpires: null
    });

    const token = getSignedJwtToken(user._id);

    // Notify all Admins if a new Owner profile is registered
    if (user.role === 'owner') {
      const admins = await User.find({ role: 'admin' });
      const Notification = require('../models/Notification');
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: 'New Owner Registration',
          message: `A new Owner "${user.name}" (${user.email}) has registered and is awaiting profile approval.`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isApprovedOwner: user.isApprovedOwner
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify OTP (Retained for route backward compatibility, but automatically succeeds)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    const token = getSignedJwtToken(user._id);
    res.status(200).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user (Bypasses OTP checking entirely)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is blocked by Admin
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the Administrator' });
    }

    // Force verification status to true for easy login bypass
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isApprovedOwner: user.isApprovedOwner
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Forgot Password (Sends a password reset link to the email)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Save to user model
    user.otp = resetToken;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${email}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;
    const html = `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p><p>Please click the link below to reset your password:</p><p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #5C4033; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p><p>Or copy this link: ${resetUrl}</p><p>This link will expire in 10 minutes.</p>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'PGVerse Password Reset Link',
        message,
        html
      });

      res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent: ' + err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    const user = await User.findOne({ 
      email,
      otp: token,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedPGs');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      profilePicture: req.body.profilePicture
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin Firebase Login Integration
// @route   POST /api/auth/admin-firebase-login
// @access  Public
exports.adminFirebaseLogin = async (req, res) => {
  try {
    const { email, name, uid } = req.body;

    let admin = await User.findOne({ email });
    if (!admin) {
      admin = await User.create({
        name: name || 'Firebase Admin',
        email,
        password: uid || 'firebase-admin-password-mock',
        role: 'admin',
        phone: '0000000000',
        isVerified: true
      });
    }

    const token = getSignedJwtToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

