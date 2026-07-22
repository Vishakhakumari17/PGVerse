const OfflineAdmission = require('../models/OfflineAdmission');
const PG = require('../models/PG');

// @desc    Admit a student offline
// @route   POST /api/offline-admissions
// @access  Private (Owner/Admin)
exports.createAdmission = async (req, res) => {
  try {
    req.body.owner = req.user.id;

    // Verify PG ownership
    const pg = await PG.findById(req.body.pg);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to add student to this PG' });
    }

    // Decrement room availability if roomType is found
    if (req.body.roomType) {
      const roomIndex = pg.rooms.findIndex(r => r.roomType === req.body.roomType);
      if (roomIndex > -1) {
        if (pg.rooms[roomIndex].availability > 0) {
          pg.rooms[roomIndex].availability -= 1;
          await pg.save();
        }
      }
    }

    const admission = await OfflineAdmission.create(req.body);
    res.status(201).json({ success: true, data: admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all offline admissions for current owner
// @route   GET /api/offline-admissions
// @access  Private (Owner/Admin)
exports.getAdmissions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.owner = req.user.id;
    }

    const admissions = await OfflineAdmission.find(query)
      .populate('pg', 'name location')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete/Remove offline admission
// @route   DELETE /api/offline-admissions/:id
// @access  Private (Owner/Admin)
exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await OfflineAdmission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission record not found' });
    }

    if (admission.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this admission' });
    }

    // Return the seat back to the PG
    const pg = await PG.findById(admission.pg);
    if (pg && admission.roomType) {
      const roomIndex = pg.rooms.findIndex(r => r.roomType === admission.roomType);
      if (roomIndex > -1) {
        pg.rooms[roomIndex].availability += 1;
        await pg.save();
      }
    }

    await OfflineAdmission.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update offline admission (e.g. paidFee)
// @route   PUT /api/offline-admissions/:id
// @access  Private (Owner/Admin)
exports.updateAdmission = async (req, res) => {
  try {
    let admission = await OfflineAdmission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission record not found' });
    }

    if (admission.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this admission' });
    }

    // Update fields
    const fieldsToUpdate = ['name', 'fatherName', 'mobileNumber', 'parentMobileNumber', 'aadharCard', 'paidFee', 'monthlyFee', 'roomType', 'email', 'months', 'portalPassword', 'isBlocked'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        admission[field] = req.body[field];
      }
    });

    await admission.save();
    res.status(200).json({ success: true, data: admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
