const PG = require('../models/PG');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Create new PG listing
// @route   POST /api/pgs
// @access  Private (Owner/Admin)
exports.createPG = async (req, res) => {
  try {
    req.body.owner = req.user.id;

    // Check if the user is owner or admin
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only owners or admins can list a PG' });
    }

    // Check if owner profile is approved by Admin
    if (req.user.role === 'owner' && !req.user.isApprovedOwner) {
      return res.status(403).json({ success: false, message: 'Your Owner profile is pending Admin approval. You will be able to list PGs once approved.' });
    }

    // Subscription Check for Owners
    if (req.user.role === 'owner') {
      const Subscription = require('../models/Subscription');
      const activeSub = await Subscription.findOne({
        owner: req.user.id,
        status: 'active',
        endDate: { $gt: new Date() }
      });

      if (!activeSub) {
        return res.status(403).json({
          success: false,
          message: 'No active subscription plan found. Please purchase a plan to list accommodations on PGVerse.'
        });
      }

      const currentCount = await PG.countDocuments({ owner: req.user.id });
      if (currentCount >= activeSub.listingLimit) {
        return res.status(403).json({
          success: false,
          message: `You have reached the listing limit of ${activeSub.listingLimit} PGs for your current plan. Please upgrade your subscription to add more listings.`
        });
      }
    }

    const pg = await PG.create(req.body);

    // Notify all Admins that a new PG listing requires approval
    const admins = await User.find({ role: 'admin' });
    const Notification = require('../models/Notification');
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New PG Approval Required',
        message: `Owner has listed a new accommodation "${pg.name}". Please approve/reject it in PG Management.`
      });
    }

    res.status(201).json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all PGs (with filters)
// @route   GET /api/pgs
// @access  Public
exports.getPGs = async (req, res) => {
  try {
    const query = {};

    // Filter by Approval status (Students can only see approved PGs; Owner/Admin can see all their own or all PGs)
    if (req.query.approvedOnly !== 'false') {
      if (req.query.approvedOnly === 'true' || (!req.query.role && !req.query.ownerId) || req.query.role === 'student') {
        query.isApproved = true;
      }
    }

    // Filter by Owner (for Owner Dashboard)
    if (req.query.ownerId) {
      query.owner = req.query.ownerId;
    }

    // Unified location & keyword search across all address, city, landmark, college, and name fields
    const searchTerms = [];
    if (req.query.city) searchTerms.push(req.query.city);
    if (req.query.college) searchTerms.push(req.query.college);
    if (req.query.location) searchTerms.push(req.query.location);

    if (searchTerms.length > 0) {
      const searchConditions = searchTerms.map(term => {
        const regex = { $regex: term, $options: 'i' };
        return {
          $or: [
            { name: regex },
            { description: regex },
            { 'location.city': regex },
            { 'location.address': regex },
            { 'location.landmark': regex },
            { 'location.state': regex },
            { nearbyColleges: { $elemMatch: { $regex: term, $options: 'i' } } }
          ]
        };
      });
      query.$and = searchConditions;
    }

    if (req.query.gender && req.query.gender !== 'any') {
      query.gender = req.query.gender.toLowerCase();
    }

    // Filter by Facilities (case-insensitive multi-select check)
    if (req.query.facilities) {
      const facilitiesList = req.query.facilities.split(',').map(f => new RegExp(`^${f.trim()}$`, 'i'));
      query.facilities = { $all: facilitiesList };
    }

    // Filter by Price range (requires $elemMatch to ensure the SAME room satisfies the min and max price limits)
    if (req.query.priceMin || req.query.priceMax) {
      const priceQuery = {};
      if (req.query.priceMin) {
        priceQuery.$gte = Number(req.query.priceMin);
      }
      if (req.query.priceMax) {
        priceQuery.$lte = Number(req.query.priceMax);
      }
      query.rooms = { $elemMatch: { price: priceQuery } };
    }
    const pgs = await PG.find(query).populate('owner', 'name email phone');

    res.status(200).json({ success: true, count: pgs.length, data: pgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get PG details by ID
// @route   GET /api/pgs/:id
// @access  Public
exports.getPGById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id).populate('owner', 'name email phone profilePicture');
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Fetch reviews for this PG
    const reviews = await Review.find({ pg: req.params.id }).populate('user', 'name profilePicture');

    res.status(200).json({ success: true, data: pg, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update PG listing
// @route   PUT /api/pgs/:id
// @access  Private (Owner/Admin)
exports.updatePG = async (req, res) => {
  try {
    let pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Make sure user is owner or admin
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to update this PG' });
    }

    // If an owner updates the PG, reset approval status to false so admin can review again (optional, for safety)
    if (req.user.role === 'owner' && !req.body.bypassApprovalReset) {
      req.body.isApproved = false;
    }

    // Clean custom property bypass flag if present to avoid DB schema pollution
    delete req.body.bypassApprovalReset;

    pg = await PG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete PG listing
// @route   DELETE /api/pgs/:id
// @access  Private (Owner/Admin)
exports.deletePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Make sure user is owner or admin
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this PG' });
    }

    // Use deleteOne to trigger hooks (remove hook)
    await PG.deleteOne({ _id: req.params.id });

    // Delete associated reviews
    await Review.deleteMany({ pg: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle Save PG for User
// @route   POST /api/pgs/:id/save
// @access  Private (Student)
exports.toggleSavePG = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pgId = req.params.id;

    // Check if PG exists
    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    const index = user.savedPGs.indexOf(pgId);
    let message = '';
    
    if (index > -1) {
      // Already saved, remove it
      user.savedPGs.splice(index, 1);
      message = 'PG unsaved successfully';
    } else {
      // Not saved, add it
      user.savedPGs.push(pgId);
      message = 'PG saved successfully';
    }

    await user.save();
    res.status(200).json({ success: true, message, savedPGs: user.savedPGs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add review for PG
// @route   POST /api/pgs/:id/reviews
// @access  Private (Student/User)
exports.addReview = async (req, res) => {
  try {
    const pgId = req.params.id;
    const { rating, comment, images } = req.body;

    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ pg: pgId, user: req.user.id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this PG' });
    }

    const review = await Review.create({
      pg: pgId,
      user: req.user.id,
      rating,
      comment,
      images: images || []
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reply to a review
// @route   POST /api/pgs/reviews/:reviewId/reply
// @access  Private (Owner)
exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.reviewId).populate('pg');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is owner of the PG
    if (review.pg.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to reply to reviews for this PG' });
    }

    review.ownerReply = reply;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/pgs/reviews/:reviewId
// @access  Private (Student/Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Authorized if student who wrote it or Admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const pgId = review.pg;
    await Review.deleteOne({ _id: req.params.reviewId });

    // Manually trigger rating refresh since hooks do aggregate
    await Review.getAverageRating(pgId);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve/Disapprove a PG (Admin only)
// @route   PUT /api/pgs/:id/approve
// @access  Private (Admin)
exports.approvePG = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );

    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    // Send notification to Owner when their PG is approved
    if (isApproved === true) {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: pg.owner,
        title: 'PG Listing Approved',
        message: `Your PG listing "${pg.name}" has been approved by the Admin and is now live.`
      });
    }

    res.status(200).json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get public stats for metrics (Happy Students, Trusted PG Owners, Average Rating)
// @route   GET /api/pgs/public-stats
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const verifiedOwnersCount = await User.countDocuments({ role: 'owner', isApprovedOwner: true });
    const verifiedPgsCount = await PG.countDocuments({ isApproved: true });

    // Aggregate average rating across all reviews
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = ratingStats.length > 0 ? Number(ratingStats[0].averageRating.toFixed(1)) : 4.8;

    res.status(200).json({
      success: true,
      data: {
        studentCount,
        verifiedOwnersCount,
        verifiedPgsCount,
        averageRating
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
