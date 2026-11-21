const express = require('express');
const router = express.Router();
const {
  getPayments,
  getInvoices,
  recordPayment,
  reversePayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(authorize('super_admin', 'academy_admin'), recordPayment);

router.get('/invoices', getInvoices);

router.post('/:id/reverse', authorize('super_admin', 'academy_admin'), reversePayment);

module.exports = router;
