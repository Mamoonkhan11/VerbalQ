const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password, requiredRole } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Role-based access control for login portal
    if (requiredRole === 'admin') {
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have admin privileges.'
        });
      }
    } else {
      // Default to user login portal
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admins must log in via the admin portal.'
        });
      }
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token including role for verification
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Determine redirect path based on role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        redirectPath
      }
    });
  });

  /**
   * Forgot password - request reset token
   * POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.'
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to user field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (1 hour)
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // SIMULATION: In a real app, send an email here using nodemailer
    console.log(`--- PASSWORD RESET EMAIL SIMULATION ---`);
    console.log(`To: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`----------------------------------------`);

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email.'
    });
  });

  /**
   * Reset password using token
   * POST /api/auth/reset-password/:token
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  });
}

module.exports = new AuthController();