const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Create a user
// @route   POST /api/v1/users
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 characters or more'
    ).isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exist' }] });
      }

      // Create new user
      user = new User({ name, email, password });
      await user.save();

      // Create token
      const token = user.getSignedJwtToken();

      res.status(201).json({
        success: true,
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
