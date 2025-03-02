import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import config from '../config/config.js';
import { createError } from '../utils/errors.js';
import crypto from 'crypto';

// Generate JWT token with standardized configuration
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '24h'
  });
};

// Format user response data
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('👉 Login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      throw createError(400, 'Please provide email and password');
    }

    // Check if user exists and get password
    const user = await User.findOne({ email })
      .select('+password +active')
      .exec();

    console.log('👉 User found:', !!user);
    if (user) {
      console.log('👉 User role:', user.role);
      console.log('👉 User active status:', user.active);
      console.log('👉 User password:', user.password);
    }

    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.active) {
      throw createError(401, 'Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    console.log('👉 Password correct:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      throw createError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('👉 Token generated successfully');

    // Remove sensitive data
    user.password = undefined;
    user.active = undefined;

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw createError(400, 'Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, 'Email already registered');
    }


    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'patient' // Default role for registration
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError(400, 'Please provide an email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'No user found with this email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry to 10 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // In production, send this via email
    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email',
      resetToken // Remove in production
    });
  } catch (error) {
    // Clear reset token fields on error
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw createError(400, 'Please provide password reset token and new password');
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw createError(400, 'Invalid or expired password reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new auth token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: formatUserResponse(user),
        token: authToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        throw createError(400, 'Email already in use');
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError(400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw createError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw createError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
}; 