const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBatches)
  .post(authorize('super_admin', 'academy_admin'), createBatch);

router.route('/:id')
  .get(getBatchById)
  .put(authorize('super_admin', 'academy_admin'), updateBatch)
  .delete(authorize('super_admin', 'academy_admin'), deleteBatch);

module.exports = router;
