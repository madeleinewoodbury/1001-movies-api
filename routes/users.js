const express = require('express');
const router = express.Router();

// @desc    Test route
// @route   GET /api/v1/users/
// @access  Public
router.get('/', async (req, res) => {
  res.json({
    success: true,
    msg: 'Users route',
  });
});

module.exports = router;
