const mongoose = require('mongoose');
const User = require('../models/User');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const ContactRequest = require('../models/ContactRequest');
const ContactMessage = require('../models/ContactMessage');

// --- USER MANAGEMENT (Admins) ---

// @desc    Create a new user (student or owner)
// @route   POST /api/admin/users
// @access  Private (Admin/Owner)
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, portalPassword, course, seat, months, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const userObj = await User.create({
      name,
      email,
      phone,
      password: password || portalPassword || 'Galaxy@1234',
      portalPassword: portalPassword || password || 'Galaxy@1234',
      course: course || 'Undergraduate',
      seat: seat || 'A1',
      months: months || 1,
      role: role || 'student',
      isVerified: true
    });

    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get list of users (students or owners)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsersList = async (req, res) => {
  try {
    const { role } = req.query; // 'student' or 'owner'
    const query = {};
    if (role) query.role = role;
    else query.role = { $ne: 'admin' }; // exclude admins

    const users = await User.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve/Reject Owner or Block/Unblock User
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isApprovedOwner, isBlocked, name, email, phone, portalPassword, course, seat, months } = req.body;
    const updateFields = {};

    if (isApprovedOwner !== undefined) updateFields.isApprovedOwner = isApprovedOwner;
    if (isBlocked !== undefined) updateFields.isBlocked = isBlocked;
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (portalPassword !== undefined) updateFields.portalPassword = portalPassword;
    if (course !== undefined) updateFields.course = course;
    if (seat !== undefined) updateFields.seat = seat;
    if (months !== undefined) updateFields.months = months;

    const userObj = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send notification to Owner upon profile approval
    if (isApprovedOwner === true && userObj.role === 'owner') {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: userObj._id,
        title: 'Owner Profile Approved',
        message: 'Your Owner profile has been successfully approved by the Admin. You can now add and list accommodations.'
      });
    }

    res.status(200).json({ success: true, data: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userObj = await User.findById(req.params.id);
    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete associated PGs if owner
    if (userObj.role === 'owner') {
      await PG.deleteMany({ owner: req.params.id });
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// --- COMPLAINTS MANAGEMENT ---

// @desc    Raise a complaint ticket
// @route   POST /api/admin/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
  try {
    const { pgId, subject, description } = req.body;

    const pgObj = await PG.findById(pgId);
    if (!pgObj) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    const complaint = await Complaint.create({
      student: req.user.id,
      pg: pgId,
      subject,
      description
    });

    // Send notifications to Owner & Admins
    const Notification = require('../models/Notification');
    const studentUser = await User.findById(req.user.id);
    const studentName = studentUser ? studentUser.name : 'Student';

    // 1. Notify the Owner of the PG
    if (pgObj.owner) {
      await Notification.create({
        user: pgObj.owner,
        title: 'New Complaint Ticket Raised',
        message: `Student "${studentName}" raised a complaint for your PG "${pgObj.name}": "${subject}"`
      });
    }

    // 2. Notify all Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Complaint Ticket Raised',
        message: `Student "${studentName}" raised a complaint for PG "${pgObj.name}": "${subject}"`
      });
    }

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all complaints (or current student's complaints)
// @route   GET /api/admin/complaints
// @access  Private (Student/Admin)
exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name email phone')
      .populate('pg', 'name location')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Resolve complaint ticket
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private (Admin)
exports.resolveComplaint = async (req, res) => {
  try {
    const { resolutionDetails } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolutionDetails: resolutionDetails || 'Resolved by Administrator.'
      },
      { new: true, runValidators: true }
    ).populate('pg').populate('student');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint ticket not found' });
    }

    // Send notifications to Student & Owner
    const Notification = require('../models/Notification');

    // 1. Notify the Student who raised the complaint
    if (complaint.student) {
      await Notification.create({
        user: complaint.student._id,
        title: 'Complaint Ticket Resolved',
        message: `Your complaint about "${complaint.subject}" has been resolved: "${complaint.resolutionDetails}"`
      });
    }

    // 2. Notify the Owner of the PG
    if (complaint.pg && complaint.pg.owner) {
      await Notification.create({
        user: complaint.pg.owner,
        title: 'Complaint Ticket Resolved',
        message: `The complaint about "${complaint.subject}" for PG "${complaint.pg.name}" has been resolved by Admin.`
      });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// --- CONTACT REQUESTS MANAGEMENT (Gated contacts & Assignments) ---

// @desc    Request owner details for a preferred location (Student raises requirement)
// @route   POST /api/admin/contact-requests
// @access  Private (Student)
exports.createContactRequest = async (req, res) => {
  try {
    const { pgId, preferredLocation, budget, gender } = req.body;
    let request;

    if (pgId) {
      // Direct click "Contact Owner" from PGDetails page
      const pgObj = await PG.findById(pgId).populate('owner');
      if (!pgObj) {
        return res.status(404).json({ success: false, message: 'PG not found' });
      }

      // Check if duplicate direct request exists
      const duplicate = await ContactRequest.findOne({
        student: req.user.id,
        $or: [
          { assignedPGs: new mongoose.Types.ObjectId(pgId) },
          { acceptedPG: new mongoose.Types.ObjectId(pgId) }
        ]
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Contact request already raised for this PG' });
      }

      // Get cheapest room price for the budget
      const cheapestRoomPrice = pgObj.rooms?.reduce((min, room) => room.price < min ? room.price : min, 999999) || 5000;

      request = await ContactRequest.create({
        student: req.user.id,
        preferredLocation: pgObj.location?.city || pgObj.location?.address,
        budget: cheapestRoomPrice,
        gender: pgObj.gender || 'unisex',
        assignedPGs: [pgObj._id],
        status: 'assigned'
      });

      // Send immediate notification to owner
      if (pgObj.owner) {
        const Notification = require('../models/Notification');
        await Notification.create({
          user: pgObj.owner._id,
          title: 'Direct Student Contact Inquiry',
          message: `A student has requested your contact details regarding your PG listing "${pgObj.name}".`
        });
      }
    } else {
      // General dashboard preference matching
      if (!preferredLocation || !budget || !gender) {
        return res.status(400).json({ success: false, message: 'Please provide all details' });
      }

      // Auto match and assign matching PGs
      const pgsList = await PG.find().populate('owner');
      const matchedPGIds = [];
      const notifiedOwners = new Set();

      for (const pg of pgsList) {
        const locMatch = 
          pg.location?.city?.toLowerCase() === preferredLocation.toLowerCase() ||
          pg.location?.address?.toLowerCase().includes(preferredLocation.toLowerCase());
        
        const genderMatch = pg.gender === gender || pg.gender === 'unisex';

        if (locMatch && genderMatch) {
          matchedPGIds.push(pg._id);
          if (pg.owner) {
            notifiedOwners.add(pg.owner._id.toString());
          }
        }
      }

      request = await ContactRequest.create({
        student: req.user.id,
        preferredLocation,
        budget,
        gender,
        assignedPGs: matchedPGIds,
        status: matchedPGIds.length > 0 ? 'assigned' : 'pending'
      });

      // Send match recommendation notifications to all matching owners
      const Notification = require('../models/Notification');
      for (const ownerId of notifiedOwners) {
        await Notification.create({
          user: ownerId,
          title: 'New Student Match Recommendation',
          message: `A student matches your PG filter requirements. Check matches to review and share details.`
        });
      }
    }

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Check contact request status for a specific PG (Details page check)
// @route   GET /api/admin/contact-requests/check/:pgId
// @access  Private (Student)
exports.checkContactRequestStatus = async (req, res) => {
  try {
    const request = await ContactRequest.findOne({
      student: req.user.id,
      $or: [
        { assignedPGs: new mongoose.Types.ObjectId(req.params.pgId) },
        { acceptedPG: new mongoose.Types.ObjectId(req.params.pgId) }
      ]
    });

    res.status(200).json({
      success: true,
      exists: !!request,
      status: request ? request.status : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get contact requests (Admins see all; students see their own)
// @route   GET /api/admin/contact-requests
// @access  Private
exports.getContactRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    const requests = await ContactRequest.find(query)
      .populate('student', 'name email phone')
      .populate({
        path: 'assignedPGs',
        select: 'name location gender owner',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .populate({
        path: 'acceptedPG',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign matched Owners/PGs to a contact request (Admin)
// @route   PUT /api/admin/contact-requests/:id/assign
// @access  Private (Admin)
exports.assignOwnersToRequest = async (req, res) => {
  try {
    const { pgIds } = req.body; // array of PG IDs

    if (!pgIds || !Array.isArray(pgIds)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid list of PG IDs' });
    }

    const request = await ContactRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Contact request not found' });
    }

    request.assignedPGs = pgIds;
    request.status = 'assigned';
    await request.save();

    // Create notifications for all owners of these PGs
    const pgs = await PG.find({ _id: { $in: pgIds } }).populate('owner');
    for (const pg of pgs) {
      if (pg.owner) {
        const Notification = require('../models/Notification');
        await Notification.create({
          user: pg.owner._id,
          title: 'New Student Match Request',
          message: `A student matches your PG listing "${pg.name}". Check student requirement to Accept/Reject.`
        });
      }
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Owner accept/reject action on contact request
// @route   PUT /api/admin/contact-requests/:id/owner-action
// @access  Private (Owner)
exports.ownerActionOnRequest = async (req, res) => {
  try {
    const { pgId, action } = req.body; // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action type' });
    }

    const request = await ContactRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (action === 'accept') {
      request.status = 'approved';
      request.acceptedPG = pgId;
      await request.save();

      // Notify student
      const Notification = require('../models/Notification');
      await Notification.create({
        user: request.student,
        title: 'Owner Contact Details Shared',
        message: `An owner has accepted your match request. Contact details are now visible on your dashboard.`
      });
    } else {
      // Reject: set request status to rejected
      request.status = 'rejected';
      request.assignedPGs = request.assignedPGs.filter(id => id.toString() !== pgId);
      await request.save();

      // Notify student
      const Notification = require('../models/Notification');
      await Notification.create({
        user: request.student,
        title: 'Contact Request Rejected',
        message: `Your contact request was rejected by the Owner.`
      });
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get requirements assigned to this owner's PGs
// @route   GET /api/admin/contact-requests/owner
// @access  Private (Owner)
exports.getOwnerAssignedRequests = async (req, res) => {
  try {
    const ownerPGs = await PG.find({ owner: req.user.id });
    const ownerPGIds = ownerPGs.map(p => p._id);

    const requests = await ContactRequest.find({
      status: 'assigned',
      assignedPGs: { $in: ownerPGIds }
    })
    .populate('student', 'name email phone')
    .sort('-createdAt');

    const matchedRequests = requests.map(reqObj => {
      const matchPGs = ownerPGs.filter(p => reqObj.assignedPGs.some(id => id.toString() === p._id.toString()));
      return {
        _id: reqObj._id,
        student: reqObj.student,
        preferredLocation: reqObj.preferredLocation,
        budget: reqObj.budget,
        gender: reqObj.gender,
        status: reqObj.status,
        matchedPGs: matchPGs
      };
    });

    res.status(200).json({ success: true, data: matchedRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// --- EXTENDED ADMIN DASHBOARD OVERVIEW METRICS ---

// @desc    Get system overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const pendingOwners = await User.countDocuments({ role: 'owner', isApprovedOwner: false });
    const totalPGs = await PG.countDocuments();
    const approvedPGs = await PG.countDocuments({ isApproved: true });
    const totalBookings = await Booking.countDocuments();
    
    // Most booked PG (by aggregating booking references)
    const mostBookedAggregate = await Booking.aggregate([
      { $group: { _id: '$pg', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostBookedPGName = 'N/A';
    if (mostBookedAggregate.length > 0) {
      const pgObj = await PG.findById(mostBookedAggregate[0]._id);
      if (pgObj) mostBookedPGName = pgObj.name;
    }

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalOwners,
        pendingOwners,
        totalPGs,
        approvedPGs,
        totalBookings,
        mostBookedPG: mostBookedPGName
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit a contact form message
// @route   POST /api/admin/contact-messages
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const newMessage = await ContactMessage.create({ name, email, message });
    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/admin/contact-messages
// @access  Private (Admin)
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt');
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

