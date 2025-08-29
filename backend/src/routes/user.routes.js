const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');

// @access  Private
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;