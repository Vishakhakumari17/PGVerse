const express = require('express');
const {
  createPG,
  getPGs,
  getPGById,
  updatePG,
  deletePG,
  toggleSavePG,
  addReview,
  replyToReview,
  deleteReview,
  approvePG,
  getPublicStats
} = require('../controllers/pgController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public-stats', getPublicStats);

router.route('/')
  .post(protect, authorize('owner', 'admin'), createPG)
  .get(getPGs);

router.route('/:id')
  .get(getPGById)
  .put(protect, authorize('owner', 'admin'), updatePG)
  .delete(protect, authorize('owner', 'admin'), deletePG);

router.post('/:id/save', protect, toggleSavePG);
router.post('/:id/reviews', protect, addReview);
router.post('/reviews/:reviewId/reply', protect, authorize('owner', 'admin'), replyToReview);
router.delete('/reviews/:reviewId', protect, deleteReview);

router.put('/:id/approve', protect, authorize('admin'), approvePG);

module.exports = router;
