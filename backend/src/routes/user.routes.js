const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getUserProfile } = require('../controllers/user.controller');

// @access  Private
router.get('/profile', protect, getUserProfile);

module.exports = router;