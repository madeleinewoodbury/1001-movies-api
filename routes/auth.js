const express = require('express');
const router = express.Router();

// @desc    Test route
// @route   GET /api/v1/auth/
// @access  Public
router.get('/', async (req, res) => {
  res.json({
    success: true,
    msg: 'Auth route',
  });
});

module.exports = router;
