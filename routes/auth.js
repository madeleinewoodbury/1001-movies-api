const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @route   GET /api/auth
// @desc    Get logged in user
// @acess   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).sen('Server Error');
  }
});

// @route   POST /api/v1/auth
// @desc    Authenticate user and get token
// @acess   Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Create token
      const token = user.getSignedJwtToken();

      res.status(200).json({
        success: true,
        token,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route POST/api/v1/auth/forgotpassword
// @desc Forgot password
// @access Public
router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetURL = `http://localhost:3000/resetpassword/${resetToken}`;

    const msg = `
    <p>Hello ${user.name.split(' ')[0]}</p>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password. Click the link below to reset your password.</p>
    <a href='${resetURL}'>Reset password</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Password',
        html: msg,
      });

      res
        .status(200)
        .json({ success: true, data: `Email sent to ${user.email}` });
    } catch (err) {
      console.log(err);
      user.getResetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).send('Sever Error');
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Sever Error');
  }
});

// @route PUT/api/v1/auth/resetpassword/:resettoken
// @desc Reset password
// @access Public
router.put('/resetpassword/:resettoken', async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid token' }] });
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.password = req.body.password;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin',
      token: token,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Sever Error');
  }
});

module.exports = router;
