const Booking = require('../models/Booking');
const PG = require('../models/PG');
const Notification = require('../models/Notification');

// Helper to create notifications
const createNotificationHelper = async (userId, title, message) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message
    });
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = async (req, res) => {
  try {
    const { pgId, roomType, bookingDate, duration, advancePaymentAmount, transactionId } = req.body;

    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Check room availability
    const roomIndex = pg.rooms.findIndex(r => r.roomType === roomType);
    if (roomIndex === -1) {
      return res.status(400).json({ success: false, message: 'Room type not found in this PG' });
    }

    if (pg.rooms[roomIndex].availability <= 0) {
      return res.status(400).json({ success: false, message: 'No rooms of this type are currently available' });
    }

    // Generate unique receipt number
    const timestamp = Date.now().toString();
    const receiptNumber = `PGV-${timestamp.substring(timestamp.length - 8)}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await Booking.create({
      pg: pgId,
      student: req.user.id,
      roomType,
      bookingDate,
      duration,
      advancePaymentAmount,
      paymentStatus: 'completed', // For mock checkout flow, payment is completed immediately
      bookingStatus: 'pending',
      receiptNumber,
      transactionId: transactionId || `TXN-${Date.now()}`
    });

    // Notify Owner
    await createNotificationHelper(
      pg.owner,
      'New Booking Request',
      `You have received a new booking request for ${pg.name} (${roomType}) from ${req.user.name}.`
    );

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get bookings of current user (Student: their own, Owner: bookings for their PGs, Admin: all)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'owner') {
      // Find all PGs owned by this owner
      const pgs = await PG.find({ owner: req.user.id });
      const pgIds = pgs.map(p => p._id);
      query.pg = { $in: pgIds };
    }

    const bookings = await Booking.find(query)
      .populate('pg', 'name location gender owner')
      .populate('student', 'name email phone profilePicture')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('pg', 'name location facilities gender owner')
      .populate('student', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check
    const isStudent = booking.student._id.toString() === req.user.id;
    const isOwner = booking.pg.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status (Accept/Reject)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'rejected', 'cancelled'
    
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('pg');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    // If changing from pending/rejected to accepted, decrement availability
    if (status === 'accepted' && booking.bookingStatus !== 'accepted') {
      const roomIndex = booking.pg.rooms.findIndex(r => r.roomType === booking.roomType);
      if (roomIndex > -1) {
        if (booking.pg.rooms[roomIndex].availability <= 0) {
          return res.status(400).json({ success: false, message: 'No rooms available to confirm this booking' });
        }
        booking.pg.rooms[roomIndex].availability -= 1;
        await booking.pg.save();
      }
    }

    // If changing from accepted to rejected/cancelled, increment availability back
    if ((status === 'rejected' || status === 'cancelled') && booking.bookingStatus === 'accepted') {
      const roomIndex = booking.pg.rooms.findIndex(r => r.roomType === booking.roomType);
      if (roomIndex > -1) {
        booking.pg.rooms[roomIndex].availability += 1;
        await booking.pg.save();
      }
    }

    booking.bookingStatus = status;
    await booking.save();

    // Notify Student
    await createNotificationHelper(
      booking.student,
      `Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your booking request for ${booking.pg.name} has been ${status} by the owner.`
    );

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Owner Revenue Analytics
// @route   GET /api/analytics/owner
// @access  Private (Owner)
exports.getOwnerAnalytics = async (req, res) => {
  try {
    // PGs owned by this owner
    const pgs = await PG.find({ owner: req.user.id });
    const pgIds = pgs.map(p => p._id);

    // Bookings for these PGs that are accepted/completed
    const bookings = await Booking.find({ pg: { $in: pgIds }, bookingStatus: 'accepted' });

    // Calculate metrics
    let totalRevenue = 0;
    const roomTypeStats = {};
    const pgRevenueStats = {};

    bookings.forEach(b => {
      totalRevenue += b.advancePaymentAmount;
      roomTypeStats[b.roomType] = (roomTypeStats[b.roomType] || 0) + 1;
    });

    pgs.forEach(p => {
      pgRevenueStats[p.name] = 0;
    });

    bookings.forEach(b => {
      const pgName = pgs.find(p => p._id.toString() === b.pg.toString())?.name || 'Unknown PG';
      pgRevenueStats[pgName] = (pgRevenueStats[pgName] || 0) + b.advancePaymentAmount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalPGs: pgs.length,
        totalBookings: bookings.length,
        totalRevenue,
        roomTypeDistribution: roomTypeStats,
        pgRevenueBreakdown: pgRevenueStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Admin Analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalPGs = await PG.countDocuments();
    const approvedPGs = await PG.countDocuments({ isApproved: true });
    
    const bookings = await Booking.find({ bookingStatus: 'accepted' });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.advancePaymentAmount, 0);

    // Monthly bookings distribution (mock aggregator or based on createdAt)
    const monthlyStats = {};
    bookings.forEach(b => {
      const month = b.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalOwners,
        totalPGs,
        approvedPGs,
        totalBookings: bookings.length,
        totalRevenue,
        monthlyBookings: monthlyStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update booking payment status
// @route   PUT /api/bookings/:id/payment-status
// @access  Private (Owner/Admin)
exports.updateBookingPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const booking = await Booking.findById(req.params.id).populate('pg');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
