const Subscription = require('../models/Subscription');
const PG = require('../models/PG');
const User = require('../models/User');

// @desc    Owner requests a subscription plan purchase
// @route   POST /api/subscriptions
// @access  Private (Owner)
exports.purchasePlan = async (req, res) => {
  try {
    const { planName, transactionId } = req.body;

    if (!['basic', 'standard', 'premium'].includes(planName)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Determine price and listing limits
    let price = 299;
    let listingLimit = 2;
    if (planName === 'standard') {
      price = 799;
      listingLimit = 10;
    } else if (planName === 'premium') {
      price = 1499;
      listingLimit = 9999; // Represents unlimited
    }

    // Check if the owner already has a pending subscription
    const existingPending = await Subscription.findOne({
      owner: req.user.id,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a subscription request pending Admin approval.'
      });
    }

    // Generate unique receipt number
    const timestamp = Date.now().toString();
    const receiptNumber = `SUB-${timestamp.substring(timestamp.length - 8)}-${Math.floor(100 + Math.random() * 900)}`;

    const subscription = await Subscription.create({
      owner: req.user.id,
      planName,
      price,
      listingLimit,
      status: 'pending',
      paymentStatus: 'pending',
      receiptNumber,
      transactionId: transactionId || `TXN-${Date.now()}`
    });

    // Notify all Admins that a new subscription payment requires approval
    const admins = await User.find({ role: 'admin' });
    const Notification = require('../models/Notification');
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Subscription Payment Pending 💰',
        message: `Owner "${req.user.name}" has requested to purchase the ${planName.toUpperCase()} plan (₹${price}). Please approve it in Subscription Plans.`
      });
    }

    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current active subscription and limit statistics for owner
// @route   GET /api/subscriptions/owner
// @access  Private (Owner)
exports.getOwnerSubscription = async (req, res) => {
  try {
    // Find active subscription
    const activeSub = await Subscription.findOne({
      owner: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    // Find any pending request
    const pendingSub = await Subscription.findOne({
      owner: req.user.id,
      status: 'pending'
    });

    // Get list of all past plans
    const history = await Subscription.find({ owner: req.user.id }).sort({ createdAt: -1 });

    // Count currently active PG listings owned by this user
    const listingsCount = await PG.countDocuments({ owner: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        activeSubscription: activeSub || null,
        pendingSubscription: pendingSub || null,
        listingsUsed: listingsCount,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all subscriptions transactions (Admin only)
// @route   GET /api/subscriptions
// @access  Private (Admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve and activate pending subscription
// @route   PUT /api/subscriptions/:id/approve
// @access  Private (Admin)
exports.approveSubscription = async (req, res) => {
  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (sub.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Subscription is not pending approval' });
    }

    // Deactivate/expire all current active plans for this owner
    await Subscription.updateMany(
      { owner: sub.owner, status: 'active' },
      { status: 'expired' }
    );

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (sub.planName === 'basic') {
      endDate.setDate(startDate.getDate() + 30); // 1 Month
    } else if (sub.planName === 'standard') {
      endDate.setDate(startDate.getDate() + 180); // 6 Months
    } else if (sub.planName === 'premium') {
      endDate.setDate(startDate.getDate() + 365); // 1 Year
    }

    sub.status = 'active';
    sub.paymentStatus = 'paid';
    sub.startDate = startDate;
    sub.endDate = endDate;

    await sub.save();

    // Also automatically approve the owner's profile when activating subscription
    const User = require('../models/User');
    await User.findByIdAndUpdate(sub.owner, { isApprovedOwner: true });

    // Create Notification for the Owner
    const Notification = require('../models/Notification');
    await Notification.create({
      user: sub.owner,
      title: 'Subscription Activated 🚀',
      message: `Your ${sub.planName.toUpperCase()} plan is now active! You can now publish up to ${sub.listingLimit === 9999 ? 'unlimited' : sub.listingLimit} PG listings.`
    });

    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Extend active subscription by 30 days
// @route   PUT /api/subscriptions/:id/extend
// @access  Private (Admin)
exports.extendSubscription = async (req, res) => {
  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (sub.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active subscriptions can be extended' });
    }

    // Extend by 30 days
    const currentEndDate = new Date(sub.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + 30);
    sub.endDate = currentEndDate;

    await sub.save();

    // Notify Owner
    const Notification = require('../models/Notification');
    await Notification.create({
      user: sub.owner,
      title: 'Subscription Extended 📅',
      message: `Admin has extended your active subscription expiry date to ${currentEndDate.toLocaleDateString()}.`
    });

    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private (Admin)
exports.cancelSubscription = async (req, res) => {
  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    sub.status = 'cancelled';
    await sub.save();

    // Notify Owner
    const Notification = require('../models/Notification');
    await Notification.create({
      user: sub.owner,
      title: 'Subscription Cancelled ⚠️',
      message: `Your subscription plan has been cancelled by the platform administrator.`
    });

    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get subscription revenue metrics & dashboard card data
// @route   GET /api/subscriptions/admin/stats
// @access  Private (Admin)
exports.getSubscriptionStats = async (req, res) => {
  try {
    // Total Active Plans
    const activeCount = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gt: new Date() }
    });

    // Expired Plans
    const expiredCount = await Subscription.countDocuments({
      status: 'expired'
    });

    // Pending Payments
    const pendingCount = await Subscription.countDocuments({
      status: 'pending'
    });

    // Calculate Revenues (based on paid status)
    const paidSubscriptions = await Subscription.find({ paymentStatus: 'paid' });

    let monthlyRevenue = 0; // Sum of basic/monthly plans
    let yearlyRevenue = 0;  // Sum of premium/yearly plans
    let totalRevenue = 0;   // Sum of all paid subscriptions

    paidSubscriptions.forEach(sub => {
      totalRevenue += sub.price;
      if (sub.planName === 'basic') {
        monthlyRevenue += sub.price;
      } else if (sub.planName === 'premium') {
        yearlyRevenue += sub.price;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        activePlans: activeCount,
        expiredPlans: expiredCount,
        pendingPayments: pendingCount,
        monthlyRevenue,
        yearlyRevenue,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
