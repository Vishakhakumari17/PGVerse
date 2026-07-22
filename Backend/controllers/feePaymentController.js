const fs = require('fs');
const path = require('path');
const FeePayment = require('../models/FeePayment');

// @desc    Record new fee payment
// @route   POST /api/fee-payments
// @access  Private (Owner/Admin)
exports.recordPayment = async (req, res) => {
  try {
    const {
      studentType,
      studentId,
      studentName,
      pgName,
      roomType,
      monthlyFee,
      month,
      year,
      amountPaid,
      status
    } = req.body;

    let ownerId = req.user.id;

    // If student is paying, find the owner of the PG
    if (req.user.role === 'student') {
      const PG = require('../models/PG');
      // Attempt to resolve PG by name
      const pgObj = await PG.findOne({ name: pgName });
      if (pgObj) {
        ownerId = pgObj.owner;
      }
    }

    const feePayment = await FeePayment.create({
      owner: ownerId,
      studentType,
      studentId,
      studentName,
      pgName,
      roomType,
      monthlyFee,
      month,
      year,
      amountPaid,
      status
    });

    res.status(201).json({ success: true, data: feePayment });
  } catch (err) {
    try {
      const logPath = 'C:\\Users\\sikay\\.gemini\\antigravity\\brain\\d6251afa-87d6-494a-a456-ad4a8bb0618d\\scratch\\error_log.txt';
      const logData = `Date: ${new Date().toISOString()}
Error Message: ${err.message}
Error Stack: ${err.stack}
Request User: ${JSON.stringify(req.user)}
Request Body: ${JSON.stringify(req.body)}
`;
      fs.writeFileSync(logPath, logData);
    } catch (logErr) {
      console.error('Failed to write error log:', logErr);
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all payments recorded by current owner
// @route   GET /api/fee-payments/owner
// @access  Private (Owner/Admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({ owner: req.user.id }).sort('-paymentDate');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a payment record
// @route   DELETE /api/fee-payments/:id
// @access  Private (Owner/Admin)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Verify ownership
    if (payment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this payment record' });
    }

    await payment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
