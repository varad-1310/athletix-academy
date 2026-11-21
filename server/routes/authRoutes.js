const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.post('/register', protect, authorize('super_admin'), register);
router.get('/users', protect, authorize('super_admin'), getAllUsers);

module.exports = router;
