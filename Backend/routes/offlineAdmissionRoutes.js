const express = require('express');
const {
  createAdmission,
  getAdmissions,
  deleteAdmission,
  updateAdmission
} = require('../controllers/offlineAdmissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('owner', 'admin'));

router.route('/')
  .post(createAdmission)
  .get(getAdmissions);

router.route('/:id')
  .delete(deleteAdmission)
  .put(updateAdmission);

module.exports = router;
